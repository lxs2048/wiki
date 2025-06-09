import React,{ useState,useRef } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.scss';
import Notification from "@site/src/components/Notification";
function AuthSource({children}:{children:React.ReactNode}) {
  const {
    siteConfig: {customFields},
  } = useDocusaurusContext();
  const [hide,setHide] = useState(true)
  const [showErrMsg, setShowErrMsg] = useState<boolean>(false);
  const errInfo = "code错误"
  const InputRef = useRef(null)
  const checkVal = ()=>{
    let val = InputRef.current.value
    if(val === customFields?.authSourceCode){
      setHide(false)
    }else{
      setHide(true)
      setShowErrMsg(true);
      setTimeout(() => {
        setShowErrMsg(false);
      }, 2000);
    }
  }

  return (
    <div className={styles['custom-answer-container']}>
      <div className={styles['input-answer-box']}>
        <input id={styles['input-form-box']} ref={InputRef} type="text" /> <div className={styles['show-answer-btn']} onClick={checkVal}>查询</div>
      </div>
      {
        !hide && <div className={styles['custom-answer-content']}>{children}</div>
      }
      <Notification show={showErrMsg} errorIcon={true} title={errInfo} changeShow={setShowErrMsg} />
    </div>
  )
}

export default AuthSource