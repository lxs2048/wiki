import React, { useEffect } from 'react'
import Player from 'qier-player';
import styles from './styles.module.scss';
import useIsBrowser from '@docusaurus/useIsBrowser';
// https://vortesnail.github.io/qier-player/zh-CN/doc/quick-start

function QierPlayer({style={}}) {
  const isBrowser = useIsBrowser();
  useEffect(()=>{
    if(isBrowser){
      const player = new Player({
        src: 'https://blog-guiyexing.oss-cn-qingdao.aliyuncs.com/video/videoplayback.mp4',
      });
      player.mount('#player-mount-point')
    }
  },[isBrowser])
  return <div className={styles['video-container']} style={style}>
    <div id='player-mount-point' className={styles['video-inner']}></div>
  </div>
}

export default QierPlayer
