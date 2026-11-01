import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ItemSelect } from "@/features/battle/components/ItemSelect";
import type { CompetitiveItem } from "@/features/battle/constants/competitiveItems";

vi.mock("@/components/ui/ItemSprite", () => ({
  ItemSprite: ({ itemName }: { itemName: string }) => <div data-testid={`sprite-${itemName}`} />,
}));

vi.mock("@/features/battle/constants/competitiveItems", async (importOriginal) => {
  const mod = (await importOriginal()) as any;
  return {
    ...mod,
    COMPETITIVE_ITEMS: [
      { id: "choice-band", name: "choice-band", nameEs: "Cinta Elegida" },
      { id: "life-orb", name: "life-orb", nameEs: "Vidasfera" },
    ],
    filterCompetitiveItems: (list: CompetitiveItem[]) => list,
  };
});

const mockItemList: CompetitiveItem[] = [
  {
    id: "choice-band", name: "choice-band", nameEs: "Cinta Elegida",
    description: "Sube 50% el Ataque", effect: "1.5x Atk",
    descriptionEs: "Sube 50% el Ataque", effectEs: "1.5x ATQ",
  },
  {
    id: "", name: "life-orb", nameEs: "Vidasfera",
    description: "Boosts power 30%", effect: "1.3x damage",
    descriptionEs: "Potencia 30% pero quita 10% PS", effectEs: "1.3x daño",
  },
] as unknown as CompetitiveItem[];

describe("ItemSelect.integration.test - Fase 4 (con jest-dom)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("abre dropdown y busca 'vida' -> muestra Vidasfera", async () => {
    const user = userEvent.setup();
    render(<ItemSelect itemList={mockItemList} value="" onValueChange={vi.fn()} placeholder="—" />);

    await user.click(screen.getByRole("button"));
    const searchInput = await screen.findByPlaceholderText("Busca objeto...");
    expect(searchInput).toBeInTheDocument();

    await user.type(searchInput, "vida");

    await waitFor(() => {
      expect(screen.getByText("Vidasfera")).toBeInTheDocument();
    });
    expect(screen.queryByText("Cinta Elegida")).not.toBeInTheDocument();
  });

  it("emite item.name (no id vacío) al seleccionar Vidasfera", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ItemSelect itemList={mockItemList} value="" onValueChange={onValueChange} placeholder="—" />);

    await user.click(screen.getByRole("button"));
    const input = await screen.findByPlaceholderText("Busca objeto...");
    await user.type(input, "vida");
    await waitFor(() => expect(screen.getByText("Vidasfera")).toBeInTheDocument());

    await user.click(screen.getByText("Vidasfera"));

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("life-orb");
    expect(onValueChange).not.toHaveBeenCalledWith("");
  });
});
