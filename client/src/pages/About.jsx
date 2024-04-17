import React from 'react'

const About = () => {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='max-w-2xl mx-auto p-3 text-center'>
        <div>
          <h1 className='text-3xl font font-semibold text-center my-7'>About Kunal's Blog</h1>
          <div className='text-md text-gray-500 flex flex-col gap-6'>
            <p>
              I'm a software engineer with a passion for web development, programming and Artificial Intelligence. I love to write about these topics and share
              my knowledge with others.
            </p>
            <p>
              I'm a passionate learner and I'm always looking for new things to learn. I believe that the best way to learn is to teach, so I started this blog
              to share my knowledge with others. I hope you find my articles helpful and informative.
            </p>
            <p>
              you can expect articles related to web development, software engineering, programming languages, and Artificial Intelligence. I'll be writing
              tutorials, tips and tricks, and other interesting articles on these topics. Apart from technical articles, I'll also be writing about my
              personal experiences and thoughts on various topics.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
