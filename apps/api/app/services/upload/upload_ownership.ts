import type { UploadActor } from '#types/upload'

export function canManageUpload(
  actor: UploadActor,
  resource: { uploaderType: string; uploaderId: number }
): boolean {
  return (
    (actor.type === 'admin' && actor.isSuperAdmin === true) ||
    (resource.uploaderType === actor.type && resource.uploaderId === actor.id)
  )
}
