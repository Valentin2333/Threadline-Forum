import { useEffect } from "react";

const useLoginPrefill = ({
  locationState,
  setInfoMessage,
  prefilledEmail,
  setValue,
}) => {
  useEffect(() => {
    if (locationState?.authMessage) {
      setInfoMessage(locationState.authMessage);
    }

    if (prefilledEmail) {
      setValue("email", prefilledEmail);
    }
  }, [locationState, prefilledEmail, setInfoMessage, setValue]);
};

export default useLoginPrefill;
