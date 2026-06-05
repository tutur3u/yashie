import {
  createYashieExternalProjectsClient,
  setupYashieAdminStudio,
  getYashieAdminSession,
} from "@/lib/yashie-admin-api";
import { deleteYashieContentItem, updateYashieContentItem } from "@/lib/yashie-admin-content";
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
    await setupYashieAdminStudio(session.accessToken);
    const { errors, input } = parseYashieContentFormData(collectionKey, await request.formData());

    if (!input) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    return NextResponse.json(
      await updateYashieContentItem(
        createYashieExternalProjectsClient(session.accessToken),
        getYashieWorkspaceId(),
        collectionKey,
        entryId,
        input,
      ),
    );
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
    await setupYashieAdminStudio(session.accessToken);

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
