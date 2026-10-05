import { expect, mock, test } from "bun:test";
import type { ReactElement } from "react";

const react = await import("react");
let state: Record<string, unknown>;
let pending: Array<(current: typeof state) => typeof state>;
mock.module("react", () => ({
  ...react,
  useState: (initial: typeof state) => {
    state = initial;
    pending = [];
    return [initial, (update: (current: typeof state) => typeof state) => pending.push(update)];
  },
}));
const { NavigationItemDialog } = await import("./YashieAdminDashboard");

type Node = ReactElement<{ children?: Node | Node[]; type?: string; onChange?: (event: unknown) => void }>;
function findCheckbox(node: Node): Node | undefined {
  if (node.type === "input" && node.props.type === "checkbox") return node;
  for (const child of [node.props.children].flat().filter(Boolean) as Node[]) {
    const result = typeof child === "object" ? findCheckbox(child) : undefined;
    if (result) return result;
  }
}

for (const visible of [true, false]) {
  test(`visibility ${visible} survives deferred React event cleanup and preserves the latest label`, () => {
    const tree = NavigationItemDialog({
      currentItem: { entryId: "nav-blog", key: "blog", label: "Blog", visible: !visible },
      onApply: () => undefined, onClose: () => undefined, submitting: false,
    }) as Node;
    const checkbox = findCheckbox(tree)!;
    const event: { currentTarget: { checked: boolean } | null } = { currentTarget: { checked: visible } };
    checkbox.props.onChange!(event);
    // React clears currentTarget after the handler, before a deferred updater
    // may run or be replayed alongside another edit.
    event.currentTarget = null;
    state = { ...state, label: "Edited Blog" };
    for (const update of pending) state = update(state);
    expect(state).toMatchObject({ entryId: "nav-blog", key: "blog", label: "Edited Blog", visible });
    for (const update of pending) state = update(state);
    expect(state.visible).toBe(visible);
  });
}
