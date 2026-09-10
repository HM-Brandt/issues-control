/**
 * Convierte cualquier fecha/string UTC a la zona horaria de Chicago (America/Chicago).
 *
 * @param dateInput - String de fecha (ej: "9/2/2026, 8:50:02 PM"), Date object o Timestamp
 * @returns Fecha formateada en la zona horaria de Chicago
 */
export const formatUTCTime = (
  dateInput: string | Date | number | null | undefined,
): string => {
  if (!dateInput) return "";

  try {
    let date: Date;

    if (typeof dateInput === "string") {
      const cleanInput = dateInput.trim();

      // Si viene en formato SQL: "2026-09-02 20:50:02" (con o sin milisegundos)
      const sqlRegex = /^(\d{4})-(\d{2})-(\d{2})[\sT](\d{2}):(\d{2}):(\d{2})/;
      const match = cleanInput.match(sqlRegex);

      if (match) {
        const [, year, month, day, hour, minute, second] = match.map(Number);
        // Date.UTC usa meses indexados en 0 (Enero = 0, Septiembre = 8)
        date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
      } else {
        // Para formatos ISO o standard que ya incluyan 'Z'
        date = new Date(cleanInput);
      }
    } else {
      date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) return "";

    return date.toLocaleString("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

export const formatToUSDate = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return "";

  try {
    if (typeof dateInput === "string") {
      const cleanInput = dateInput.trim();
      
      // Si viene como "2026-09-04"
      const match = cleanInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const [, year, month, day] = match;
        // Elimina los ceros a la izquierda para el estilo M/D/YYYY
        return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
      }
    }

    // Para objetos Date
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      timeZone: "UTC", // Mantiene el día exacto de la DB
    });
  } catch (error) {
    console.error("Error formatting US date:", error);
    return "";
  }
};