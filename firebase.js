<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyB9YCfzsQ15joYqWCjGwo3uusv8y6cAWb8",
    authDomain: "gas-stations---cr.firebaseapp.com",
    projectId: "gas-stations---cr",
    storageBucket: "gas-stations---cr.firebasestorage.app",
    messagingSenderId: "667050639894",
    appId: "1:667050639894:web:ca71d69e69e9a87a72eb37",
    measurementId: "G-D3VFM5PBLH"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>