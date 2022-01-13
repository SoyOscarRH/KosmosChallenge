import { useCallback, useReducer } from "react"
import { v4 as uuidv4 } from "uuid"

import "./App.css"

type CommonFormField = { _uid: string; label: string }
type FormField = CommonFormField &
  ({ type: "text" } | { type: "select" | "radio"; options: Array<string> })

function AddPossibilities({ addField }: { addField: (field: FormField) => void }) {
  const addText = () => addField({ _uid: uuidv4(), type: "text", label: "New text field title" })

  const addSelect = () =>
    addField({
      _uid: uuidv4(),
      type: "select",
      label: "New select field title",
      options: ["option 1"],
    })

  const addRadio = () =>
    addField({
      _uid: uuidv4(),
      type: "radio",
      label: "New radio field title",
      options: ["option 1"],
    })

  return (
    <section className="optionsToAdd">
      <button className="adder" onClick={addText}>
        Add Text
      </button>
      <button className="adder" onClick={addSelect}>
        Add Select
      </button>
      <button className="adder" onClick={addRadio}>
        Add Radio
      </button>
    </section>
  )
}

function Field({ field }: { field: FormField }) {
  switch (field.type) {
    case "text":
      return (
        <>
          <label htmlFor={field._uid}>{field.label}</label>
          <input name={field._uid} type="text" />
        </>
      )
    case "select":
      return (
        <>
          <label htmlFor={field._uid}>{field.label}</label>
          <select name={field._uid}>
            {field.options.map((option, index) => (
              <option key={index}>{option}</option>
            ))}
          </select>
        </>
      )
    case "radio":
      return (
        <>
          <p>{field.label}</p>
          {field.options.map((option, index) => (
            <div key={index}>
              <input id={field._uid + option} name={field._uid} type="radio" value={option} />
              <label style={{ display: "inline" }} htmlFor={field._uid + option}>
                {option}
              </label>
              <br />
            </div>
          ))}
        </>
      )
  }
}

function FieldEditor({ field, dispatch }: { field: FormField; dispatch: React.Dispatch<Action> }) {
  switch (field.type) {
    case "text":
      return (
        <>
          <input
            name={field._uid + "editor"}
            value={field.label}
            onChange={e =>
              dispatch({ type: "editField", id: field._uid, field: { label: e.target.value } })
            }
          />
        </>
      )
    case "select":
    case "radio":
      return (
        <>
          <input
            name={field._uid + "editor"}
            value={field.label}
            onChange={e =>
              dispatch({ type: "editField", id: field._uid, field: { label: e.target.value } })
            }
          />

          <section>
            {field.options.map((option, index) => (
              <div>
                <input
                  style={{ display: "inline" }}
                  key={index}
                  type="text"
                  className="option"
                  value={option}
                  onChange={e => {
                    const newOptions = [...field.options]
                    newOptions[index] = e.target.value

                    dispatch({
                      type: "editField",
                      id: field._uid,
                      field: { options: newOptions },
                    })
                  }}
                />
                <button
                  onClick={() => {
                    dispatch({
                      type: "editField",
                      id: field._uid,
                      field: { options: field.options.filter((_, i) => i !== index) },
                    })
                  }}
                >
                  Delete option
                </button>
              </div>
            ))}
            <button
              className="option"
              onClick={() =>
                dispatch({
                  type: "editField",
                  id: field._uid,
                  field: { options: [...field.options, `option ${field.options.length + 1}`] },
                })
              }
            >
              Add option
            </button>
          </section>
        </>
      )
  }
}

type Action =
  | { type: "removeField"; id: string }
  | { type: "addField"; field: FormField }
  | { type: "editField"; id: string; field: Partial<FormField> }

const reducer = (fields: Array<FormField>, action: Action) => {
  switch (action.type) {
    case "removeField":
      return fields.filter(field => field._uid !== action.id)
    case "addField":
      return [...fields, action.field]
    case "editField":
      return fields.map(field => {
        if (field._uid == action.id) {
          return { ...field, ...action.field } as FormField
        } else {
          return field
        }
      })
    default:
      return fields
  }
}

function App() {
  const [fields, dispatch] = useReducer(reducer, [] as Array<FormField>)
  const addField = useCallback(field => dispatch({ type: "addField", field }), [])

  return (
    <main className="app">
      <h1>Dynamic Form</h1>
      <section className="divider">
        <section className="editor">
          <h2>Editor</h2>
          <AddPossibilities addField={addField} />
          {fields.map(field => (
            <details key={field._uid}>
              <summary>
                {`[${field.type}] ${field.label}`}
                <button
                  className="delete"
                  onClick={() => dispatch({ type: "removeField", id: field._uid })}
                >
                  Delete
                </button>
              </summary>
              <main>
                <FieldEditor field={field} dispatch={dispatch} />
              </main>
            </details>
          ))}
        </section>
        <section className="preview">
          <h2>Form preview</h2>
          <form>
            {fields.map(field => (
              <div key={field._uid} className="field">
                <Field field={field} />
              </div>
            ))}
          </form>
        </section>
      </section>
    </main>
  )
}

export default App
