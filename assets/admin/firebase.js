// Jediné místo, kde admin inicializuje Firebase. Ostatní moduly importují odsud.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, deleteDoc,
         serverTimestamp, query, orderBy, where, limit, Timestamp }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';

const app = initializeApp({
  apiKey:            'AIzaSyCMpXn3fBghTYqDaLrbjEN4NYz6Utlg8gI',
  authDomain:        'blog-adbe8.firebaseapp.com',
  projectId:         'blog-adbe8',
  storageBucket:     'blog-adbe8.firebasestorage.app',
  messagingSenderId: '543978071624',
  appId:             '1:543978071624:web:67d10930e0ab629d37da7d'
});

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

export {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
  collection, getDocs, doc, addDoc, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy, where, limit, Timestamp,
  storageRef, uploadBytes, getDownloadURL
};

/** Firestore odmítl čtení kvůli pravidlům (ne kvůli síti). */
export const isDenied = (e) => e && (e.code === 'permission-denied' || /permission/i.test(e.message || ''));
