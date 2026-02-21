import { useMemo } from "react";
import { supabase } from "../../../api/supabaseClient";
import Avatar from "../../navigation/Avatar";

const AvatarFromStoragePath = ({ pathOrUrl, size }) => {
  const url = useMemo(() => {
    if (!pathOrUrl) return "";

    if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
      return pathOrUrl;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(pathOrUrl);
    return data?.publicUrl ?? "";
  }, [pathOrUrl]);

  return <Avatar url={url} size={size} />;
};

export default AvatarFromStoragePath;
