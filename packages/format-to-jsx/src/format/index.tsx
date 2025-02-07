import * as React from 'react'
import { FArgs, FArgsPrimitives } from './types'

const format = <TArgs extends FArgs>(
  template: string,
  ...args: TArgs
): TArgs extends FArgsPrimitives ? string : React.ReactNode => {
  if (!template || template.length === 0) {
    throw new Error(`[format-to-jsx]: format() method has been called without a template string!`)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (args.length === 0) return template as any
  const reg = /\{([^{}]+)\}/g
  let containsJSX = false
  const argsDictionary =
    args && typeof args[0] === 'object' && !React.isValidElement(args[0])
      ? args[0]
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/indent
        args.reduce((acc: any, a, index) => {
          acc[index] = a // eslint-disable-line @typescript-eslint/indent
          return acc // eslint-disable-line @typescript-eslint/indent
        }, {}) // eslint-disable-line @typescript-eslint/indent
  const parts = template.split(reg)

  if (process.env.NODE_ENV !== 'production') {
    const noOfPlaceholders = Array.from(
      new Set(
        parts.reduce((acc: string[], element, index) => {
          if ((index & 1) == 0) return acc
          return [...acc, element]
        }, [])
      )
    ).length
    const noOfArgs = Object.keys(argsDictionary).length
    if (noOfPlaceholders !== noOfArgs) {
      // eslint-disable-next-line no-console
      console.warn(
        `[format-to-jsx]: Template '${template}' contains different number of placeholders than passed arguments ([${Object.keys(
          argsDictionary
        ).join(',')}]): found ${noOfPlaceholders} placeholders while ${noOfArgs} arguments have been provided.`
      )
    }
  }
  const results = parts.map((value, index) => {
    if ((index & 1) == 0) {
      // this is template so just return
      return value
    } else {
      const key = value
      const replaceValue = argsDictionary[key]

      if (key in argsDictionary) {
        if (typeof replaceValue !== 'string' && typeof replaceValue !== 'number') {
          containsJSX = true
        }
        return replaceValue
      } else {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn(`[format-to-jsx]: Failed replacing the template '${template}' - '${key}' index wasn't provided!`)
        }
        return ''
      }
    }
  })
  if (containsJSX) {
    return (
      // eslint-disable-next-line react/no-array-index-key
      <>{results.map((e, index) => (React.isValidElement(e) ? React.cloneElement(e, { key: index }) : e))}</>
    ) as any // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return results.join('') as any
}

export default format
