import { adminHandler, ok, parseId, readJson } from '@/lib/api';
import { deleteInquiry, updateInquiry } from '@/lib/queries';
import { inquiryPatchSchema } from '@/lib/validation';

export const PATCH = adminHandler(async (req, { params }) => {
  const body = inquiryPatchSchema.parse(await readJson(req));
  return ok(await updateInquiry(parseId(params.id), body));
});

export const DELETE = adminHandler(async (_req, { params }) => {
  return ok(await deleteInquiry(parseId(params.id)));
});
