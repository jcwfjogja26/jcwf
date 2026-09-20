import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

type StoryResponse = {
  story: {
    reflection: string;
    participant: {
      fullName: string;
    } | null;
  };
};

async function getStory(
  request: NextRequest,
  token: string
): Promise<StoryResponse | null> {
  const origin = new URL(request.url).origin;

  try {
    const response = await fetch(
      `${origin}/api/story/${token}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{
    token: string;
  }>;
}) {
  const { token } = await params;

  const storyData = await getStory(
    new NextRequest("http://localhost"),
    token
  );

  const story = storyData?.story;

  const participantName =
    story?.participant?.fullName ||
    "JCWF Participant";

  const reflection =
    story?.reflection ||
    "A story from Jogja Cultural Wellness Festival.";

  const shortenedReflection =
    reflection.length > 230
      ? `${reflection.slice(0, 227)}...`
      : reflection;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#F7F4EA",
          padding: "60px",
          color: "#1D241B",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "999px",
              backgroundColor: "#1D241B",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: 700,
            }}
          >
            J
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                letterSpacing: "2px",
              }}
            >
              JCWF 2026
            </div>

            <div
              style={{
                marginTop: "4px",
                fontSize: "13px",
                color: "#7B816D",
                letterSpacing: "1px",
              }}
            >
              JOGJA CULTURAL WELLNESS FESTIVAL
            </div>
          </div>
        </div>

        {/* Main */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "62px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              color: "#7B816D",
              letterSpacing: "3px",
              fontWeight: 600,
            }}
          >
            MY JCWF STORY
          </div>

          <div
            style={{
              marginTop: "18px",
              fontSize: "48px",
              lineHeight: 1.08,
              fontWeight: 700,
              maxWidth: "950px",
            }}
          >
            A Story Today,
            <br />
            A Brighter Tomorrow
          </div>

          <div
            style={{
              marginTop: "28px",
              fontSize: "25px",
              lineHeight: 1.45,
              color: "#3F443A",
              maxWidth: "980px",
            }}
          >
            “{shortenedReflection}”
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: "17px",
                fontWeight: 700,
              }}
            >
              {participantName}
            </div>

            <div
              style={{
                marginTop: "5px",
                fontSize: "13px",
                color: "#85897D",
              }}
            >
              Reconnecting — People, Culture & Wellbeing
            </div>
          </div>

          <div
            style={{
              fontSize: "13px",
              color: "#85897D",
            }}
          >
            Yogyakarta · 2026
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}