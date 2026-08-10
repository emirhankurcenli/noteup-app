import { useState, useEffect } from "react";
import { MediaStorageService } from "../services/mediaStorageService";

/**
 * Given a media URI ('idb://...', 'file://...', 'data:...', 'http...'),
 * resolves it asynchronously to a displayable URL/Base64.
 */
export function useResolvedMedia(rawUri) {
  const [resolvedUrl, setResolvedUrl] = useState(rawUri || "");

  useEffect(() => {
    let isMounted = true;
    if (!rawUri) {
      setResolvedUrl("");
      return;
    }

    if (rawUri.startsWith("idb://") || rawUri.startsWith("file://")) {
      MediaStorageService.getMedia(rawUri)
        .then((data) => {
          if (isMounted) setResolvedUrl(data || "");
        })
        .catch((err) => {
          console.warn("[useResolvedMedia] Resolving media failed:", err);
          if (isMounted) setResolvedUrl("");
        });
    } else {
      setResolvedUrl(rawUri);
    }

    return () => {
      isMounted = false;
    };
  }, [rawUri]);

  return resolvedUrl;
}
