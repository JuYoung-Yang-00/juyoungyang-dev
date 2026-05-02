import { notFound } from "next/navigation";
import World from "@/components/game/World";
import { ISLANDS } from "@/lib/game/islands";

export function generateStaticParams() {
  return ISLANDS.map((i) => ({ id: i.id }));
}

export default async function WorldPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!ISLANDS.find((i) => i.id === id)) notFound();
  return <World id={id} />;
}
