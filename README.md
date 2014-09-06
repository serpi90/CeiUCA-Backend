# CeiUCAweb

Backend for the CeiUCAweb Project

## Installation

1. Set up a mysql database.
2. Create a `config.json` file using default.json as template.
3. Run `npm install`
4. Add careers with: `node createCareer.js <career name>`
5. Add subjects with: `node createSubject.js <career id> <subject name>`

To start the server: `node index.js`.

---

## API

### GET /Materias
- Returns the list of subjects with their respective careers.
- No Arguments
- Example Result:
```
[{
    "id":1,
    "name":"Programacion I",
    "CareerId":1,
    "career": {
        "id":1,
        "name":"Ing. Informatica"
    }
}]
```

### GET /Examenes
- Returns the list of exams of a given `subject`
- Arguments: encoded in `querystring` format
    - subject: `int` the id of the exam subject
- Response:
    - id: `int`
    - year: `int` the year of the exam
    - turn: `string` one of:
        - **Feb**: February Final exam
        - **Jul**: July Final exam
        - **Dec**: December Final exam
        - **SP**: Special call Final exam
        - **Par**: Midterm exam
        - **Rec**: Midterm Recuperatory exam
    - call: `int` number of the call / midterm exam
    - ext: `string` the file extension
    - mimeType: `string`
- Example Request: `GET Examenes?subject=1`
- Example Result:
```
[{
    "id":1,
    "year":410,
    "turn":"Feb",
    "call":1,
    "ext":"txt",
    "mimeType":"text/plain"
}]
```

### GET /Examen
- Returns an exam file
- Arguments: encoded in `querystring` format
    - id: `int` the id of the exam
- Example Request: `GET Examen?id=1`

### GET /Apuntes
- Returns the list of exams of a given `subject`
- Arguments: given in `querystring` format
    - subject: `int` the id of the note subject
- Response:
    - id: `int`
    - name: `string` the file name
    - ext: `string` the file extension
    - mimeType: `string`
- Example Request: `GET Apuntes?subject=1`
- Example Result:
```
[{
    "id":2,
    "name":"test",
    "ext":"txt",
    "mimeType":"text/plain"
}]
```

### GET /Apunte
- Returns an note file
- Arguments: encoded in `querystring` format
    - id: `int` the id of the exam
- Example Request: `GET Apunte?id=1`

### POST /Examen
- Uploads an exam file
- Arguments: encoded in `multipart/form-data`
    - file: `binary` the file itself
    - subject: `int` the id of the exam subject
    - year: `int` the year of the exam was taken
    - turn: `string` (case insensitive)
      one of the following strings representing the exam date
        - february
        - july
        - december
        - special
        - partial
        - recuperatory
    - call: `int` number of the call / midterm exam
- Response:
    - success: `boolean`

### POST /Apunte
- Uploads a note file
- Arguments: encoded in `multipart/form-data`
    - file: `binary` the file itself
    - subject: `int` the id of the note subject
- Response:
    - success: `boolean`


