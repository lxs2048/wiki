import React, { useEffect, useRef, cloneElement, useState } from 'react'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import styles from '../css/components/tooltip.module.css'
import { useLayoutEffect } from 'react'

const ToolTip = ({ children, content }) => {
  const childrenRef = useRef(null)
  const [color = 'black', setColor] = useState(null)
  const [id, setId] = useState(`tooltip-${Date.now().toString().slice(5)}`)
  useLayoutEffect(() => {
    setColor(childrenRef?.current?.color)
    tippy(`#${id}`, {
      content,
    })
  }, [])

  return (
    <span data-tippy id={id} className={styles.tooltip} style={{ color }} tabIndex='0'>
      {cloneElement(children, {
        ref: childrenRef,
      })}
    </span>
  )
}

export default ToolTip
