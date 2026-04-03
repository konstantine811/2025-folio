/**
 * Єдиний сегмент Firestore/Storage для спільного Node Writer (не per-user uid).
 * Після зміни шляху: перенести дані з `node-writer/{старийUid}/` у `node-writer/shared/`.
 */
export const NODE_WRITER_WORKSPACE_SCOPE = "shared";

/** Має збігатися з перевіркою в `firestore.rules` / `storage.rules`. */
export const NODE_WRITER_ADMIN_EMAIL = "constainabrams@gmail.com";

export function isNodeWriterAdminEmail(
  email: string | null | undefined,
): boolean {
  if (!email) return false;
  return (
    email.trim().toLowerCase() === NODE_WRITER_ADMIN_EMAIL.toLowerCase()
  );
}
