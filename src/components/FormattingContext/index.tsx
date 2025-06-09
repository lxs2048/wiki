import React from 'react'
import styles from './styles.module.css';
function FormattingContext() {
  return (
    <div id={styles['formatting-custom-box']}>
      <div id={styles.margin}>margin:20px;</div>
      <div id={styles.bfc}>
        <div id={styles['containing-block']}>
          <div id={styles['parent-box']}>
            <div id={styles.inner1}>
              float:
              right
            </div>
            <div id={styles.inner2}>
              position:
              absolute
            </div>
            <div id={styles.inner3}>
              margin:
              30px
            </div>
            parent box
          </div>
          containing block
        </div>
        block formatting context/margin:20px
      </div>
    </div>
  )
}

export default FormattingContext

export const FormattingContextBase = ()=>{
  return (
    <div id={styles['formatting-custom-box']}>
      <div id={styles.margin}>margin:20px;</div>
      <div id={styles.bfc}>
        <div id={styles['containing-block']}>
          <div id={styles['parent-box']}>
            parent box
          </div>
          containing block
        </div>
        block formatting context/margin:20px
      </div>
    </div>
  )
}

export const FormattingContextFloat = ()=>{
  return (
    <div id={styles['formatting-custom-box']}>
      <div id={styles.margin}>margin:20px;</div>
      <div id={styles.bfc}>
        <div id={styles['containing-block']}>
          <div id={styles['parent-box']}>
            <div id={styles.inner1}>
              float:
              right
            </div>
            parent box
          </div>
          containing block
        </div>
        block formatting context/margin:20px
      </div>
    </div>
  )
}
export const FormattingContextPosition = ()=>{
  return (
    <div id={styles['formatting-custom-box']}>
      <div id={styles.margin}>margin:20px;</div>
      <div id={styles.bfc}>
        <div id={styles['containing-block']}>
          <div id={styles['parent-box']}>
            <div id={styles.inner1}>
              float:
              right
            </div>
            <div id={styles.inner2}>
              position:
              absolute
            </div>
            parent box
          </div>
          containing block
        </div>
        block formatting context/margin:20px
      </div>
    </div>
  )
}
