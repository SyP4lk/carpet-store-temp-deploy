"use client"

import Footer from '@/components/shared/footer'
import Navbar from '@/components/shared/navbar'
import React, { useEffect } from 'react'

const FeedBack = () => {
  useEffect(() => {
    const r = "big_light_70000001103690198";
    const u = "PGhlYWQ+PHNjcmlwdCB0eXBlPSJ0ZXh0L2phdmFzY3JpcHQiPgogICAgd2luZG93Ll9fc2l6ZV9fPSdiaWcnOwogICAgd2luZG93Ll9fdGhlbWVfXz0nbGlnaHQnOwogICAgd2luZG93Ll9fYnJhbmNoSWRfXz0nNzAwMDAwMDExMDM2OTAxOTgnCiAgICB3aW5kb3cuX19vcmdJZF9fPSc3MDAwMDAwMTEwMzY5MDE5NycKICAgPC9zY3JpcHQ+PHNjcmlwdCBjcm9zc29yaWdpbj0iYW5vbnltb3VzIiB0eXBlPSJtb2R1bGUiIHNyYz0iaHR0cHM6Ly9kaXNrLjJnaXMuY29tL3dpZGdldC1jb25zdHJ1Y3Rvci9hc3NldHMvaWZyYW1lLmpzIj48L3NjcmlwdD48bGluayByZWw9Im1vZHVsZXByZWxvYWQiIGNyb3Nzb3JpZ2luPSJhbm9ueW1vdXMiIGhyZWY9Imh0dHBzOi8vZGlzay4yZ2lzLmNvbS93aWRnZXQtY29uc3RydWN0b3IvYXNzZXRzL2RlZmF1bHRzLmpzIj48bGluayByZWw9InN0eWxlc2hlZXQiIGNyb3Nzb3JpZ2luPSJhbm9ueW1vdXMiIGhyZWY9Imh0dHBzOi8vZGlzay4yZ2lzLmNvbS93aWRnZXQtY29uc3RydWN0b3IvYXNzZXRzL2RlZmF1bHRzLmNzcyI+PC9oZWFkPjxib2R5PjxkaXYgaWQ9ImlmcmFtZSI+PC9kaXY+PC9ib2R5Pg==";
    
    const l = document.getElementById(r) as HTMLIFrameElement;
    if (l && l.contentWindow) {
      l.contentWindow.document.open();
      l.contentWindow.document.write(decodeURIComponent(escape(atob(u))));
      l.contentWindow.document.close();
    }
  }, []); // faqat bir marta ishlaydi

  return (
    <div className='flex flex-col gap-10'>
      <Navbar mode="dark" />
      <div className='flex justify-center'>
        <iframe
          id="big_light_70000001103690198"
          frameBorder="0"
          width="600"
          height="600"
          sandbox="allow-modals allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
        />
      </div>
      <Footer />
    </div>
  )
}

export default FeedBack
