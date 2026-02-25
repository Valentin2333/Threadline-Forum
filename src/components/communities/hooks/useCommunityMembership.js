import { useEffect, useState, useCallback } from "react";
import {
  isMember,
  joinCommunity,
  leaveCommunity,
} from "../../../api/communities";

const useCommunityMembership = ({ communityId, userId }) => {
  const [member, setMember] = useState(false);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    if (!communityId || !userId) {
      setMember(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const yes = await isMember({ communityId, userId });
      setMember(yes);
    } catch {
      setMember(false);
    } finally {
      setLoading(false);
    }
  }, [communityId, userId]);

  useEffect(() => {
    check();
  }, [check]);

  const join = async () => {
    if (!communityId || !userId) return;
    await joinCommunity({ communityId, userId });
    setMember(true);
  };

  const leave = async () => {
    if (!communityId || !userId) return;
    await leaveCommunity({ communityId, userId });
    setMember(false);
  };

  return { member, loading, join, leave, refresh: check };
};

export default useCommunityMembership;
