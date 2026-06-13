import {
  createYashieExternalProjectsClient,
  getYashieAdminSession,
} from "@/lib/yashie-admin-api";
import { deleteYashieContentItem, updateYashieContentItem } from "@/lib/yashie-admin-content";
import { createYashieContentMutationStream } from "@/lib/yashie-admin-content-stream";
import {
  parseYashieContentFormData,
  resolveYashieAdminCollectionKey,
} from "@/lib/yashie-admin-content-model";
import { getYashieWorkspaceId } from "@/lib/yashie-config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function readErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

async function readParams(context: { params: Promise<{ collection: string; entryId: string }> }) {
  const { collection, entryId } = await context.params;

  return {
    collectionKey: resolveYashieAdminCollectionKey(collection),
    entryId,
  };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ collection: string; entryId: string }> },
) {
  const session = await getYashieAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { collectionKey, entryId } = await readParams(context);

  if (!collectionKey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { errors, input } = parseYashieContentFormData(collectionKey, await request.formData());

    if (!input) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const client = createYashieExternalProjectsClient(session.accessToken);
    const workspaceId = getYashieWorkspaceId();

    return createYashieContentMutationStream({
      fallback: "Content request failed",
      run: (onProgress) =>
        updateYashieContentItem(client, workspaceId, collectionKey, entryId, input, {
          onProgress,
        }),
    });
  } catch (error) {
    return NextResponse.json({ error: readErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ collection: string; entryId: string }> },
) {
  const session = await getYashieAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { collectionKey, entryId } = await readParams(context);

  if (!collectionKey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    return NextResponse.json(
      await deleteYashieContentItem(
        createYashieExternalProjectsClient(session.accessToken),
        getYashieWorkspaceId(),
        collectionKey,
        entryId,
      ),
    );
  } catch (error) {
    return NextResponse.json({ error: readErrorMessage(error) }, { status: 500 });
  }
}
