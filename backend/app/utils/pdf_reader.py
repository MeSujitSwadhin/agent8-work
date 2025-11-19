from app.schemas.event_row import EventRow
import pdfplumber

def parse_pdf(file_path):
    results = []

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            table = page.extract_table()
            if not table:
                continue

            # Normalize header (lowercase only)
            header = [h.lower() for h in table[0]]

            for row in table[1:]:
                data = dict(zip(header, row))

                # Convert TRUE/FALSE to boolean
                img_gen_value = str(data["imagegenerate"]).strip().lower()
                is_image_generated = img_gen_value in ["true", "1", "yes"]

                results.append(EventRow(
                    slno=int(data["slno"]),
                    topic=str(data["topic"]),
                    imageGenerated=is_image_generated,
                    selectDate=str(data["selectdate"]),
                    time=str(data["time"])
                ))

    return results