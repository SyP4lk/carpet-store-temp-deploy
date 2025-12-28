import Image from 'next/image'
import React, { FC } from 'react'
import Navbar from './navbar'

type Props = {
  filter: string
  image: string
}

const Banner: FC<Props> = ({ filter, image }) => {
  return (
    <div className='w-full overflow-hidden relative'>
      <Navbar />
      <div className='flex justify-center items-center pt-20 pb-5 md:pb-30'>
        <h1 className='text-4xl md:text-7xl font-bold text-white p-10 text-center'>
          {filter?.toUpperCase().replace('-', ' ')}
        </h1>
      </div>
      <Image 
      src={image} 
      alt={filter} 
      fill priority 
      className='object-cover absolute -z-10 brightness-75' />
    </div>
  )
}

export default Banner
