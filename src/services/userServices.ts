import admin from "../utils/firebase";

const db = admin.firestore();

export const createUser = async (uid: string, data: any) => {
  await db.collection("users").doc(uid).set(data);
};

export const getUser = async (uid: string) => {
  const user = await db.collection("users").doc(uid).get();
  return user.exists ? user.data() : null;
};
