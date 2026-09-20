"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import CollectionQRCode from "@/components/admin/CollectionQRCode";

type CardItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  points: number;
  sortOrder: number;
  status: "active" | "inactive";
};

type QRCodeItem = {
  id: string;
  code: string;
  boothName: string;
  location: string | null;
  status: "active" | "inactive";
  cardId: string;
  card: {
    id: string;
    name: string;
    slug: string;
    points: number;
    imageUrl: string | null;
  } | null;
};

type CardForm = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  points: string;
  sortOrder: string;
  status: "active" | "inactive";
};

type QRForm = {
  cardId: string;
  boothName: string;
  location: string;
  code: string;
  status: "active" | "inactive";
};

const emptyCardForm: CardForm = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  points: "20",
  sortOrder: "0",
  status: "active",
};

const emptyQRForm: QRForm = {
  cardId: "",
  boothName: "",
  location: "",
  code: "",
  status: "active",
};

export default function AdminCollectionPage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const [editingCard, setEditingCard] =
    useState<CardItem | null>(null);

  const [editingQR, setEditingQR] =
    useState<QRCodeItem | null>(null);

  const [cardForm, setCardForm] =
    useState<CardForm>(emptyCardForm);

  const [qrForm, setQRForm] =
    useState<QRForm>(emptyQRForm);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const activeCards = useMemo(
    () =>
      cards.filter(
        (card) => card.status === "active"
      ),
    [cards]
  );

  async function loadData() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/collection",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Gagal mengambil data collection."
        );
      }

      setCards(data.cards ?? []);
      setQrCodes(data.qrCodes ?? []);
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreateCard() {
    setEditingCard(null);
    setCardForm(emptyCardForm);
    setCardModalOpen(true);
  }

  function openEditCard(card: CardItem) {
    setEditingCard(card);

    setCardForm({
      name: card.name,
      slug: card.slug,
      description:
        card.description ?? "",
      imageUrl: card.imageUrl ?? "",
      points: String(card.points),
      sortOrder: String(card.sortOrder),
      status: card.status,
    });

    setCardModalOpen(true);
  }

  function closeCardModal() {
    if (saving) return;

    setCardModalOpen(false);
    setEditingCard(null);
    setCardForm(emptyCardForm);
  }

  function openCreateQR() {
    setEditingQR(null);

    setQRForm({
      ...emptyQRForm,
      cardId:
        activeCards.length > 0
          ? activeCards[0].id
          : "",
    });

    setQrModalOpen(true);
  }

  function openEditQR(item: QRCodeItem) {
    setEditingQR(item);

    setQRForm({
      cardId: item.cardId,
      boothName: item.boothName,
      location: item.location ?? "",
      code: item.code,
      status: item.status,
    });

    setQrModalOpen(true);
  }

  function closeQRModal() {
    if (saving) return;

    setQrModalOpen(false);
    setEditingQR(null);
    setQRForm(emptyQRForm);
  }

  function handleCardNameChange(
    value: string
  ) {
    setCardForm((current) => {
      if (editingCard) {
        return {
          ...current,
          name: value,
        };
      }

      const generatedSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      return {
        ...current,
        name: value,
        slug: generatedSlug,
      };
    });
  }

  async function saveCard(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!cardForm.name.trim()) {
      setMessage({
        type: "error",
        text: "Nama card wajib diisi.",
      });
      return;
    }

    if (!cardForm.slug.trim()) {
      setMessage({
        type: "error",
        text: "Slug wajib diisi.",
      });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch(
        "/api/admin/collection",
        {
          method: editingCard
            ? "PATCH"
            : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "card",
            ...(editingCard
              ? { id: editingCard.id }
              : {}),
            name: cardForm.name.trim(),
            slug: cardForm.slug.trim(),
            description:
              cardForm.description.trim(),
            imageUrl:
              cardForm.imageUrl.trim(),
            points: Number(cardForm.points),
            sortOrder: Number(
              cardForm.sortOrder
            ),
            status: cardForm.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Gagal menyimpan collection card."
        );
      }

      setMessage({
        type: "success",
        text: editingCard
          ? "Collection card berhasil diperbarui."
          : "Collection card berhasil dibuat.",
      });

      closeCardModal();
      await loadData();
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan collection card.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function saveQR(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!qrForm.cardId) {
      setMessage({
        type: "error",
        text: "Pilih collection card.",
      });
      return;
    }

    if (!qrForm.boothName.trim()) {
      setMessage({
        type: "error",
        text: "Nama booth wajib diisi.",
      });
      return;
    }

    if (!qrForm.code.trim()) {
      setMessage({
        type: "error",
        text: "Code QR wajib diisi.",
      });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch(
        "/api/admin/collection",
        {
          method: editingQR
            ? "PATCH"
            : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "qr",
            ...(editingQR
              ? { id: editingQR.id }
              : {}),
            cardId: qrForm.cardId,
            boothName:
              qrForm.boothName.trim(),
            location:
              qrForm.location.trim(),
            code: qrForm.code.trim(),
            status: qrForm.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Gagal menyimpan booth QR."
        );
      }

      setMessage({
        type: "success",
        text: editingQR
          ? "Booth QR berhasil diperbarui."
          : "Booth QR berhasil dibuat.",
      });

      closeQRModal();
      await loadData();
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan booth QR.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function toggleCard(
    card: CardItem
  ) {
    try {
      const response = await fetch(
        "/api/admin/collection",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "card",
            id: card.id,
            name: card.name,
            slug: card.slug,
            description:
              card.description ?? "",
            imageUrl:
              card.imageUrl ?? "",
            points: card.points,
            sortOrder: card.sortOrder,
            status:
              card.status === "active"
                ? "inactive"
                : "active",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Gagal mengubah status card."
        );
      }

      setMessage({
        type: "success",
        text: `Card "${card.name}" sekarang ${
          card.status === "active"
            ? "nonaktif"
            : "aktif"
        }.`,
      });

      await loadData();
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Gagal mengubah status card.",
      });
    }
  }

  async function toggleQR(
    item: QRCodeItem
  ) {
    try {
      const response = await fetch(
        "/api/admin/collection",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "qr",
            id: item.id,
            cardId: item.cardId,
            boothName: item.boothName,
            location:
              item.location ?? "",
            code: item.code,
            status:
              item.status === "active"
                ? "inactive"
                : "active",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Gagal mengubah status QR."
        );
      }

      setMessage({
        type: "success",
        text: `QR "${item.boothName}" sekarang ${
          item.status === "active"
            ? "nonaktif"
            : "aktif"
        }.`,
      });

      await loadData();
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Gagal mengubah status QR.",
      });
    }
  }

  async function deleteCard(
    card: CardItem
  ) {
    const confirmed = window.confirm(
      `Hapus collection card "${card.name}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        "/api/admin/collection",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "card",
            id: card.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Gagal menghapus card."
        );
      }

      setMessage({
        type: "success",
        text: "Collection card berhasil dihapus.",
      });

      await loadData();
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Gagal menghapus card.",
      });
    }
  }

  async function deleteQR(
    item: QRCodeItem
  ) {
    const confirmed = window.confirm(
      `Hapus QR "${item.boothName}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        "/api/admin/collection",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "qr",
            id: item.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Gagal menghapus QR."
        );
      }

      setMessage({
        type: "success",
        text: "Booth QR berhasil dihapus.",
      });

      await loadData();
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Gagal menghapus QR.",
      });
    }
  }

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F7F6F2] px-5 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8C8A82]">
                Experience
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#20231F]">
                My Collection
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#77766F]">
                Kelola digital collection cards dan
                QR booth yang digunakan peserta untuk
                mengumpulkan kartu selama festival.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/admin/collection/history"
                className="inline-flex items-center rounded-full border border-[#17382A]/10 bg-white px-5 py-3 text-sm font-semibold text-[#17382A] transition hover:bg-[#17382A] hover:text-white"
              >
                View History →
              </a>

              <button
                type="button"
                onClick={openCreateCard}
                className="rounded-xl bg-[#17382A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#214C39]"
              >
                + Add Collection Card
              </button>
            </div>
          </div>

          {/* MESSAGE */}
          {message && (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border-[#CFE2D2] bg-[#F1F8F2] text-[#285C35]"
                  : "border-[#E8CCCC] bg-[#FFF5F5] text-[#8A3333]"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* SUMMARY */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#E7E5DF] bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8C8A82]">
                Collection Cards
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#20231F]">
                {cards.length}
              </p>

              <p className="mt-1 text-xs text-[#8C8A82]">
                {activeCards.length} active
              </p>
            </div>

            <div className="rounded-2xl border border-[#E7E5DF] bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8C8A82]">
                Booth QR
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#20231F]">
                {qrCodes.length}
              </p>

              <p className="mt-1 text-xs text-[#8C8A82]">
                {
                  qrCodes.filter(
                    (item) =>
                      item.status === "active"
                  ).length
                }{" "}
                active
              </p>
            </div>

            <div className="rounded-2xl border border-[#E7E5DF] bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8C8A82]">
                Points
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#20231F]">
                {cards.reduce(
                  (total, card) =>
                    total + card.points,
                  0
                )}
              </p>

              <p className="mt-1 text-xs text-[#8C8A82]">
                total card points
              </p>
            </div>
          </div>

          {/* COLLECTION CARDS */}
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#20231F]">
                  Collection Cards
                </h2>

                <p className="mt-1 text-sm text-[#77766F]">
                  Kartu digital yang akan dikumpulkan
                  peserta.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateCard}
                className="rounded-lg border border-[#D8D5CD] bg-white px-3 py-2 text-xs font-semibold text-[#20231F] hover:bg-[#FAF9F6]"
              >
                + Add Card
              </button>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-[#E7E5DF] bg-white p-10 text-center text-sm text-[#77766F]">
                Loading collection cards...
              </div>
            ) : cards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D9D6CD] bg-white p-10 text-center">
                <p className="text-sm font-semibold text-[#20231F]">
                  Belum ada collection card.
                </p>

                <p className="mt-1 text-sm text-[#77766F]">
                  Buat card pertama untuk mulai
                  mengatur collection.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="overflow-hidden rounded-2xl border border-[#E7E5DF] bg-white"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#ECEAE3]">
                      {card.imageUrl ? (
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-[0.12em] text-[#A29F96]">
                          No Image
                        </div>
                      )}

                      <span
                        className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          card.status === "active"
                            ? "bg-white text-[#285C35]"
                            : "bg-[#20231F]/80 text-white"
                        }`}
                      >
                        {card.status}
                      </span>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-[#20231F]">
                            {card.name}
                          </h3>

                          <p className="mt-1 truncate text-xs text-[#99968D]">
                            /{card.slug}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-[#F4EFE1] px-2.5 py-1 text-xs font-semibold text-[#7B5B16]">
                          +{card.points}
                        </span>
                      </div>

                      {card.description && (
                        <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#77766F]">
                          {card.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-center gap-2 border-t border-[#EEECE6] pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            openEditCard(card)
                          }
                          className="flex-1 rounded-lg border border-[#D8D5CD] px-3 py-2 text-xs font-semibold text-[#20231F] hover:bg-[#FAF9F6]"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleCard(card)
                          }
                          className="rounded-lg border border-[#D8D5CD] px-3 py-2 text-xs font-semibold text-[#77766F] hover:bg-[#FAF9F6]"
                        >
                          {card.status ===
                          "active"
                            ? "Disable"
                            : "Enable"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteCard(card)
                          }
                          className="rounded-lg border border-[#E5CCCC] px-3 py-2 text-xs font-semibold text-[#9A3E3E] hover:bg-[#FFF6F6]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* BOOTH QR */}
          <section>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#20231F]">
                  Booth QR Codes
                </h2>

                <p className="mt-1 text-sm text-[#77766F]">
                  QR yang ditempatkan secara fisik di
                  booth atau zona festival.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateQR}
                disabled={
                  activeCards.length === 0
                }
                className="rounded-lg bg-[#17382A] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#214C39] disabled:cursor-not-allowed disabled:opacity-40"
              >
                + Add Booth QR
              </button>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-[#E7E5DF] bg-white p-10 text-center text-sm text-[#77766F]">
                Loading booth QR...
              </div>
            ) : qrCodes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D9D6CD] bg-white p-10 text-center">
                <p className="text-sm font-semibold text-[#20231F]">
                  Belum ada booth QR.
                </p>

                <p className="mt-1 text-sm text-[#77766F]">
                  Tambahkan QR setelah collection
                  card tersedia.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {qrCodes.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-[#E7E5DF] bg-white"
                  >
                    <div className="border-b border-[#EEECE6] p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#99968D]">
                            Booth QR
                          </p>

                          <h3 className="mt-1 text-base font-semibold text-[#20231F]">
                            {item.boothName}
                          </h3>

                          {item.location && (
                            <p className="mt-1 text-xs text-[#77766F]">
                              {item.location}
                            </p>
                          )}
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            item.status ===
                            "active"
                              ? "bg-[#EAF4EC] text-[#285C35]"
                              : "bg-[#F0EFEC] text-[#77766F]"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="mt-4 rounded-xl bg-[#F7F6F2] px-3 py-2">
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#99968D]">
                          Collection Card
                        </p>

                        <div className="mt-1 flex items-center justify-between gap-3">
                          <p className="truncate text-xs font-semibold text-[#20231F]">
                            {item.card?.name ??
                              "Unknown Card"}
                          </p>

                          <span className="shrink-0 text-xs font-semibold text-[#7B5B16]">
                            +{item.card?.points ??
                              0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <CollectionQRCode
                        code={item.code}
                        boothName={
                          item.boothName
                        }
                        cardName={
                          item.card?.name ??
                          "Unknown Card"
                        }
                      />

                      <div className="mt-4 rounded-lg bg-[#F7F6F2] px-3 py-2 text-center">
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#99968D]">
                          QR Code
                        </p>

                        <p className="mt-1 font-mono text-xs font-semibold text-[#20231F]">
                          {item.code}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditQR(item)
                          }
                          className="rounded-lg border border-[#D8D5CD] px-2 py-2 text-xs font-semibold text-[#20231F] hover:bg-[#FAF9F6]"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleQR(item)
                          }
                          className="rounded-lg border border-[#D8D5CD] px-2 py-2 text-xs font-semibold text-[#77766F] hover:bg-[#FAF9F6]"
                        >
                          {item.status ===
                          "active"
                            ? "Disable"
                            : "Enable"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteQR(item)
                          }
                          className="rounded-lg border border-[#E5CCCC] px-2 py-2 text-xs font-semibold text-[#9A3E3E] hover:bg-[#FFF6F6]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* CARD MODAL */}
        {cardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101510]/50 px-4 py-6">
            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#EEECE6] px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#20231F]">
                    {editingCard
                      ? "Edit Collection Card"
                      : "Add Collection Card"}
                  </h2>

                  <p className="mt-1 text-xs text-[#8C8A82]">
                    Atur informasi kartu digital
                    peserta.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeCardModal}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F2ED] text-sm text-[#77766F] hover:bg-[#ECEAE3]"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={saveCard}
                className="space-y-5 p-6"
              >
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#20231F]">
                    Card Name
                  </label>

                  <input
                    value={cardForm.name}
                    onChange={(event) =>
                      handleCardNameChange(
                        event.target.value
                      )
                    }
                    placeholder="Yoga Session"
                    className="w-full rounded-xl border border-[#D8D5CD] px-4 py-3 text-sm outline-none transition focus:border-[#17382A]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#20231F]">
                    Slug
                  </label>

                  <input
                    value={cardForm.slug}
                    onChange={(event) =>
                      setCardForm(
                        (current) => ({
                          ...current,
                          slug: event.target
                            .value
                            .toLowerCase()
                            .replace(
                              /[^a-z0-9-]/g,
                              "-"
                            )
                            .replace(
                              /-+/g,
                              "-"
                            ),
                        })
                      )
                    }
                    placeholder="yoga-session"
                    className="w-full rounded-xl border border-[#D8D5CD] px-4 py-3 font-mono text-sm outline-none transition focus:border-[#17382A]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#20231F]">
                    Description
                  </label>

                  <textarea
                    value={
                      cardForm.description
                    }
                    onChange={(event) =>
                      setCardForm(
                        (current) => ({
                          ...current,
                          description:
                            event.target.value,
                        })
                      )
                    }
                    rows={3}
                    placeholder="Short description for this collection card..."
                    className="w-full resize-none rounded-xl border border-[#D8D5CD] px-4 py-3 text-sm outline-none transition focus:border-[#17382A]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#20231F]">
                    Image URL
                  </label>

                  <input
                    value={
                      cardForm.imageUrl
                    }
                    onChange={(event) =>
                      setCardForm(
                        (current) => ({
                          ...current,
                          imageUrl:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="/images/collection/yoga.jpg"
                    className="w-full rounded-xl border border-[#D8D5CD] px-4 py-3 text-sm outline-none transition focus:border-[#17382A]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#20231F]">
                      Points
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        cardForm.points
                      }
                      onChange={(event) =>
                        setCardForm(
                          (current) => ({
                            ...current,
                            points:
                              event.target
                                .value,
                          })
                        )
                      }
                      className="w-full rounded-xl border border-[#D8D5CD] px-4 py-3 text-sm outline-none transition focus:border-[#17382A]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#20231F]">
                      Sort Order
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        cardForm.sortOrder
                      }
                      onChange={(event) =>
                        setCardForm(
                          (current) => ({
                            ...current,
                            sortOrder:
                              event.target
                                .value,
                          })
                        )
                      }
                      className="w-full rounded-xl border border-[#D8D5CD] px-4 py-3 text-sm outline-none transition focus:border-[#17382A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#20231F]">
                    Status
                  </label>

                  <select
                    value={
                      cardForm.status
                    }
                    onChange={(event) =>
                      setCardForm(
                        (current) => ({
                          ...current,
                          status:
                            event.target
                              .value as
                              | "active"
                              | "inactive",
                        })
                      )
                    }
                    className="w-full rounded-xl border border-[#D8D5CD] bg-white px-4 py-3 text-sm outline-none focus:border-[#17382A]"
                  >
                    <option value="active">
                      Active
                    </option>
                    <option value="inactive">
                      Inactive
                    </option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 border-t border-[#EEECE6] pt-5">
                  <button
                    type="button"
                    onClick={closeCardModal}
                    className="rounded-xl border border-[#D8D5CD] px-4 py-2.5 text-sm font-semibold text-[#77766F]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-[#17382A] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingCard
                      ? "Save Changes"
                      : "Create Card"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QR MODAL */}
        {qrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101510]/50 px-4 py-6">
            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#EEECE6] px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#20231F]">
                    {editingQR
                      ? "Edit Booth QR"
                      : "Add Booth QR"}
                  </h2>

                  <p className="mt-1 text-xs text-[#8C8A82]">
                    QR ini akan ditempatkan secara
                    fisik di booth festival.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeQRModal}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F2ED] text-sm text-[#77766F] hover:bg-[#ECEAE3]"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={saveQR}
                className="space-y-5 p-6"
              >
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#20231F]">
                    Collection Card
                  </label>

                  <select
                    value={qrForm.cardId}
                    onChange={(event) =>
                      setQRForm(
                        (current) => ({
                          ...current,
                          cardId:
                            event.target.value,
                        })
                      )
                    }
                    className="w-full rounded-xl border border-[#D8D5CD] bg-white px-4 py-3 text-sm outline-none focus:border-[#17382A]"
                  >
                    <option value="">
                      Select collection card
                    </option>

                    {cards.map((card) => (
                      <option
                        key={card.id}
                        value={card.id}
                      >
                        {card.name} · +
                        {card.points} points
                        {card.status ===
                        "inactive"
                          ? " · Inactive"
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#20231F]">
                    Booth Name
                  </label>

                  <input
                    value={
                      qrForm.boothName
                    }
                    onChange={(event) =>
                      setQRForm(
                        (current) => ({
                          ...current,
                          boothName:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="Yoga Booth"
                    className="w-full rounded-xl border border-[#D8D5CD] px-4 py-3 text-sm outline-none focus:border-[#17382A]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#20231F]">
                    Location
                  </label>

                  <input
                    value={
                      qrForm.location
                    }
                    onChange={(event) =>
                      setQRForm(
                        (current) => ({
                          ...current,
                          location:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="Wellness Area"
                    className="w-full rounded-xl border border-[#D8D5CD] px-4 py-3 text-sm outline-none focus:border-[#17382A]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#20231F]">
                    QR Code
                  </label>

                  <input
                    value={qrForm.code}
                    onChange={(event) =>
                      setQRForm(
                        (current) => ({
                          ...current,
                          code: event.target
                            .value
                            .toUpperCase()
                            .replace(
                              /\s+/g,
                              "-"
                            ),
                        })
                      )
                    }
                    placeholder="JCWF-YOGA-01"
                    className="w-full rounded-xl border border-[#D8D5CD] px-4 py-3 font-mono text-sm uppercase outline-none focus:border-[#17382A]"
                  />

                  <p className="mt-2 text-[11px] leading-5 text-[#99968D]">
                    Code ini adalah identifier QR booth,
                    bukan QR Passport peserta.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#20231F]">
                    Status
                  </label>

                  <select
                    value={
                      qrForm.status
                    }
                    onChange={(event) =>
                      setQRForm(
                        (current) => ({
                          ...current,
                          status:
                            event.target
                              .value as
                              | "active"
                              | "inactive",
                        })
                      )
                    }
                    className="w-full rounded-xl border border-[#D8D5CD] bg-white px-4 py-3 text-sm outline-none focus:border-[#17382A]"
                  >
                    <option value="active">
                      Active
                    </option>
                    <option value="inactive">
                      Inactive
                    </option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 border-t border-[#EEECE6] pt-5">
                  <button
                    type="button"
                    onClick={closeQRModal}
                    className="rounded-xl border border-[#D8D5CD] px-4 py-2.5 text-sm font-semibold text-[#77766F]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-[#17382A] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingQR
                      ? "Save Changes"
                      : "Create QR"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </AdminShell>
  );
}