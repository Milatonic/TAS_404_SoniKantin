const SUPABASE_URL = "https://xqpogdawmqqqoakrzdts.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxcG9nZGF3bXFxcW9ha3J6ZHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDMyOTYsImV4cCI6MjA4NDQxOTI5Nn0.5HC96GHVhmCaH6LNWeMuclRGS-xq7sjpeqUxjpkMguY";

const tbody = document.getElementById("data-siswa");

// contoh mapping kelas
const classMap = {
  "5fd01639-866b-48d0-b4a8-aefb67791964": "XI-C1"
};

// helper kapitalisasi nama
function capitalize(text) {
  return text
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

fetch(`${SUPABASE_URL}/rest/v1/students?select=*`, {
  method: "GET",
  headers: {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json"
  }
})
.then(response => {
  if (!response.ok) {
    throw new Error("Gagal mengambil data dari Supabase");
  }
  return response.json();
})
.then(students => {
  tbody.innerHTML = "";

  students.forEach((student, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${student.nis}</td>
      <td>${capitalize(student.name)}</td>
      <td>${classMap[student.class_id] || "Tidak diketahui"}</td>
    `;

    tbody.appendChild(row);
  });
})
.catch(error => {
  console.error(error);
  tbody.innerHTML = `
    <tr>
      <td colspan="4">Data gagal dimuat</td>
    </tr>
  `;
});