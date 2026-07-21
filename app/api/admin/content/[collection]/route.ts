import {
  createYashieExternalProjectsClient,
  getYashieAdminSession,
} from "@/lib/yashie-admin-api";
import { createYashieContentItem, refreshYashieAdminContent } from "@/lib/yashie-admin-content";
import { createYashieContentMutationStream } from "@/lib/yashie-admin-content-stream";
import {
  parseYashieContentFormData,
  resolveYashieAdminCollectionKey,
} from "@/lib/yashie-admin-content-model";
import { getYashieWorkspaceId } from "@/lib/yashie-config";
import { NextResponse } from "next/server";

function readErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

async function readCollectionKey(context: { params: Promise<{ collection: string }> }) {
  const { collection } = await context.params;
  return resolveYashieAdminCollectionKey(collection);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ collection: string }> },
) {
  const session = await getYashieAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collectionKey = await readCollectionKey(context);

  if (!collectionKey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    return NextResponse.json({
      items: await refreshYashieAdminContent(session.accessToken, collectionKey),
    });
  } catch (error) {
    return NextResponse.json({ error: readErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ collection: string }> },
) {
  const session = await getYashieAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collectionKey = await readCollectionKey(context);

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
        createYashieContentItem(client, workspaceId, collectionKey, input, {
          onProgress,
        }),
    });
  } catch (error) {
    return NextResponse.json({ error: readErrorMessage(error) }, { status: 500 });
  }
}
