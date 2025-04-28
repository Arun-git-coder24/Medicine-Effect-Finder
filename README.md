# Medicine Effect Finder

A modern web application to find the effect of any medicine and discover the closest natural remedies for it. The app features a dynamic, single-page frontend with live search, suggestions, and a beautiful animated background, powered by a Python Flask backend.

---

## Features

- 🔍 **Live search** with auto-suggestions for medicines
- 💊 **Fetches medicine effects** from the OpenFDA API
- 🌱 **Suggests closest natural remedies** using NLP and similarity matching
- 🎨 **Modern, responsive UI** with animated floating medicine names
- ⚡ **Single-page experience** (no reloads)

---

## Project Structure

```
Medicine-Effect-Finder/
│
├── backend/
│   ├── test.py
│   ├── expanded_natural_remedy_effects.csv
│   └── (other .csv files if needed)
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── main.js
│   ├── medicines.json
│   └── (assets/ if needed)
│
├── requirements.txt
└── README.md
```

---

## Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/yourusername/Medicine-Effect-Finder.git
cd Medicine-Effect-Finder
```

### 2. Backend Setup

- Go to the `backend/` directory:
  ```sh
  cd backend
  ```
- Install dependencies:
  ```sh
  pip install -r ../requirements.txt
  ```
- Download NLTK data (first run will do this automatically, or run in Python:)
  ```python
  import nltk
  nltk.download('punkt')
  nltk.download('stopwords')
  ```
- Start the backend server:
  ```sh
  python test.py
  ```
  The API will be available at `http://127.0.0.1:5000/api/get_medicine_effect`.

### 3. Frontend Setup

- Go to the `frontend/` directory:
  ```sh
  cd ../frontend
  ```
- Open `index.html` in your browser (double-click or use a simple HTTP server):
  ```sh
  # Optional: to avoid CORS issues, you can run
  python -m http.server 8000
  # Then visit http://localhost:8000/index.html
  ```

---

## Usage

1. **Type a medicine name** in the search box (auto-suggestions will appear).
2. **Select or enter** a medicine and click "Find Effect" or press Enter.
3. **View the effect** and the closest natural remedies instantly below the search.

---

## Requirements

- Python 3.7+
- See `requirements.txt` for Python dependencies
- Modern web browser (Chrome, Firefox, Edge, etc.)

---

## Credits

- [OpenFDA API](https://open.fda.gov/apis/drug/label/) for medicine data
- [NLTK](https://www.nltk.org/) and [scikit-learn](https://scikit-learn.org/) for NLP and similarity

---

## License

MIT License
