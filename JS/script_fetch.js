const tbody = document.getElementById("data-siswa");

// mapping ID kelas → nama kelas (contoh)
const classMap = {
  "5fd01639-866b-48d0-b4a8-aefb67791964": "XI-C1"
};

// fungsi bantu: kapitalisasi nama
function capitalizeName(name) {
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

fetch("students_rows.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("Gagal mengambil data");
    }
    return response.json();
  })
  .then(students => {
    students.forEach((student, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${student.nis}</td>
        <td>${capitalizeName(student.name)}</td>
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

