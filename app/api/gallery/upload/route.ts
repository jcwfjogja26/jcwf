import { NextResponse } from "next/server";
import sharp from "sharp";

import { supabaseServer } from "@/lib/supabase-server";
import { getCurrentParticipant } from "@/lib/participant-session";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_UPLOADS_PER_DAY = 1;
const POINTS_PER_UPLOAD = 10;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(request: Request) {
  try {
    // =========================================
    // 1. Check participant session
    // =========================================

    const participant = await getCurrentParticipant();

    if (!participant) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // =========================================
    // 2. Read multipart form
    // =========================================

    const formData = await request.formData();

    const file = formData.get("file");
    const captionValue = formData.get("caption");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "Please select a photo.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 3. Validate file type
    // =========================================

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Unsupported image format. Please upload JPG, PNG, or WebP.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 4. Validate file size
    // =========================================

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "Photo must be smaller than 5 MB.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 5. Validate caption
    // =========================================

    const caption =
      typeof captionValue === "string"
        ? captionValue.trim()
        : "";

    if (caption.length > 300) {
      return NextResponse.json(
        {
          error: "Caption must be 300 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 6. Prevent multiple uploads in one day
    // =========================================

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(
      startOfTomorrow.getDate() + 1
    );

    const { count: todayUploadCount, error: countError } =
      await supabaseServer
        .from("gallery_posts")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("participant_id", participant.id)
        .gte("created_at", startOfToday.toISOString())
        .lt("created_at", startOfTomorrow.toISOString())
        .neq("status", "deleted");

    if (countError) {
      console.error(
        "Gallery upload count error:",
        countError
      );

      return NextResponse.json(
        {
          error: "Failed to check today's upload limit.",
        },
        {
          status: 500,
        }
      );
    }

    if ((todayUploadCount ?? 0) >= MAX_UPLOADS_PER_DAY) {
      return NextResponse.json(
        {
          error:
            "You can only share one moment per day.",
        },
        {
          status: 429,
        }
      );
    }

    // =========================================
    // 7. Convert image → WebP
    // =========================================

    const originalBuffer = Buffer.from(
      await file.arrayBuffer()
    );

    const optimizedBuffer = await sharp(originalBuffer)
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 82,
      })
      .toBuffer();

    // =========================================
    // 8. Create unique storage path
    // =========================================

    const fileName = `${crypto.randomUUID()}.webp`;

    const imagePath = `gallery/${participant.id}/${fileName}`;

    // =========================================
    // 9. Upload to Supabase Storage
    // =========================================

    const { error: storageError } =
      await supabaseServer.storage
        .from("gallery")
        .upload(imagePath, optimizedBuffer, {
          contentType: "image/webp",
          cacheControl: "31536000",
          upsert: false,
        });

    if (storageError) {
      console.error(
        "Gallery storage error:",
        storageError
      );

      return NextResponse.json(
        {
          error: "Failed to upload photo.",
        },
        {
          status: 500,
        }
      );
    }

    // =========================================
    // 10. Save gallery metadata
    // =========================================

    const { data: galleryPost, error: postError } =
      await supabaseServer
        .from("gallery_posts")
        .insert({
          participant_id: participant.id,
          image_path: imagePath,
          caption: caption || null,
          status: "visible",
        })
        .select()
        .single();

    if (postError) {
      console.error(
        "Gallery database error:",
        postError
      );

      // Remove uploaded image if DB insert fails
      await supabaseServer.storage
        .from("gallery")
        .remove([imagePath]);

      return NextResponse.json(
        {
          error: "Failed to save gallery post.",
        },
        {
          status: 500,
        }
      );
    }

    // =========================================
    // 11. Add points transaction
    // =========================================

    const { error: pointsError } =
      await supabaseServer
        .from("points_transactions")
        .insert({
          participant_id: participant.id,
          points: POINTS_PER_UPLOAD,
          type: "gallery_upload",
          description:
            "Shared a moment at JCWF 2026",
          reference_id: galleryPost.id,
        });

    if (pointsError) {
      console.error(
        "Points transaction error:",
        pointsError
      );

      // Remove gallery post + image if points fail
      await supabaseServer
        .from("gallery_posts")
        .delete()
        .eq("id", galleryPost.id);

      await supabaseServer.storage
        .from("gallery")
        .remove([imagePath]);

      return NextResponse.json(
        {
          error: "Failed to award points.",
        },
        {
          status: 500,
        }
      );
    }

    // =========================================
    // 12. Success
    // =========================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Moment shared successfully. You earned 10 points!",
        post: galleryPost,
        points: POINTS_PER_UPLOAD,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Gallery upload unexpected error:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong while uploading.",
      },
      {
        status: 500,
      }
    );
  }
}