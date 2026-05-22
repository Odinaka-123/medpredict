import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { HospitalUser, UserRole } from "@/types";

export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  hospitalName: string,
  role: UserRole = "technician",
) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = credential.user;

  await updateProfile(user, { displayName });

  const hospitalId =
    hospitalName.toLowerCase().replace(/\s+/g, "-") +
    "-" +
    user.uid.slice(0, 6);

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email,
    displayName,
    role,
    hospitalName,
    hospitalId,
    createdAt: serverTimestamp(),
  });

  return user;
}

export async function loginUser(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function getUserProfile(
  uid: string,
): Promise<HospitalUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as HospitalUser;
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
