import { getCurrentAdmin, updateCurrentAdmin } from '@/services/adminAuth';

export const queryCurrent = async () => ({ data: await getCurrentAdmin() });

export const updateCurrent = updateCurrentAdmin;
