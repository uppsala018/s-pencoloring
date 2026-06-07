"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserProfile } from "@/types";

export async function signUp(email: string, password: string, displayName: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await createUserDoc(cred.user, displayName);
  return cred.user;
}

export async function signIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const exists = await getDoc(doc(db, "users", cred.user.uid));
  if (!exists.exists()) {
    await createUserDoc(cred.user);
  }
  return cred.user;
}

export async function logOut() {
  await signOut(auth);
}

async function createUserDoc(user: User, displayName?: string) {
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email!,
    displayName: displayName ?? user.displayName,
    photoURL: user.photoURL,
    plan: "free",
    credits: 0,
    completedPages: [],
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, "users", user.uid), {
    ...profile,
    createdAt: serverTimestamp(),
  });
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
