import { useMemo } from "react";

const useContentPermissions = ({ userId, isAdmin, isCreator = false }) => {
  const isOwn = useMemo(
    () => (authorId) => Boolean(userId && authorId && userId === authorId),
    [userId]
  );

  const canManage = useMemo(
    () => (authorId) => {
      if (!userId) return false;
      if (userId === authorId) return true;
      if (isAdmin) return true;
      if (isCreator) return true;
      return false;
    },
    [userId, isAdmin, isCreator]
  );

  return { isOwn, canManage };
};

export default useContentPermissions;