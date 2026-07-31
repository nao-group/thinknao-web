"use client";

import { useCallback, useState } from "react";
import { Button, Group, Modal, Slider, Stack, Text, rem } from "@mantine/core";
import Cropper, { type Area } from "react-easy-crop";
import { INK } from "@/constants/colors";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function getCroppedImageBlob(imageSrc: string, crop: Area): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to export the cropped image."))),
      "image/jpeg",
      0.92
    );
  });
}

export function ImageCropModal({
  opened,
  imageSrc,
  aspect,
  cropShape,
  title,
  saving,
  onCancel,
  onSave,
}: {
  opened: boolean;
  imageSrc: string;
  aspect: number;
  cropShape: "rect" | "round";
  title: string;
  saving: boolean;
  onCancel: () => void;
  onSave: (blob: Blob) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleSave() {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
    onSave(blob);
  }

  return (
    <Modal
      opened={opened}
      onClose={onCancel}
      title={<Text fw={700} size="md" c={INK}>{title}</Text>}
      radius="md"
      size="md"
      centered
      overlayProps={{ backgroundOpacity: 0.4, blur: 2 }}
    >
      <Stack gap="md">
        <div
          style={{
            position: "relative",
            width: "100%",
            height: rem(340),
            backgroundColor: INK,
            borderRadius: rem(8),
            overflow: "hidden",
          }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={cropShape === "rect"}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>
        <Slider
          value={zoom}
          onChange={setZoom}
          min={1}
          max={3}
          step={0.01}
          label={(value) => `${value.toFixed(1)}x`}
        />
        <Group justify="flex-end">
          <Button variant="outline" color="dark" radius="md" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button
            radius="md"
            loading={saving}
            onClick={handleSave}
            style={{ backgroundColor: INK, color: "white", fontWeight: 600 }}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
