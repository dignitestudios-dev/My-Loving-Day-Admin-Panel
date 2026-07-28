"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { hydrateAuth } from "@/lib/slices/authSlice";
import { getAuthToken, getAuthUser } from "@/lib/utils/cookies";

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = getAuthToken() ?? null;
    const user = getAuthUser();
    dispatch(hydrateAuth({ token, user }));
  }, [dispatch]);

  return <>{children}</>;
}
