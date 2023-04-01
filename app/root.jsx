import { Links, LiveReload, Meta, Outlet, Link, Scripts, ScrollRestoration } from '@remix-run/react'

import styles from './styles/app.css'

export const meta = () => ({
  charset: 'utf-8',
  title: 'Basic Manga Reader',
  viewport: 'width=device-width,initial-scale=1'
})

export function links() {
  return [
    { rel: 'stylesheet', href: '/assets/css/LineIcons.2.0.css' },
    { rel: 'stylesheet', href: '/assets/css/animate.css' },
    { rel: 'stylesheet', href: '/assets/css/tiny-slider.css' },
    { rel: 'stylesheet', href: styles }
  ]
}

export default function App() {
  return (
    <html lang='en'>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {/* Header Area wrapper Starts */}
        <header id='header-wrap' className='relative'>
          {/* Navbar Start */}
          <div className='navigation fixed top-0 left-0 w-full z-30 duration-300 bg-white dark:bg-slate-700 border-b-blue-600'>
            <div className='container'>
              <nav className='navbar py-2 navbar-expand-lg flex justify-between items-center relative duration-300'>
                <Link to='/' className='navbar-brand'>
                  <img src='/logo.png' alt='Logo' style={{ width: 'auto', height: '50px' }} />
                </Link>
                <button
                  className='navbar-toggler focus:outline-none block lg:hidden'
                  type='button'
                  data-toggle='collapse'
                  data-target='#navbarSupportedContent'
                  aria-controls='navbarSupportedContent'
                  aria-expanded='false'
                  aria-label='Toggle navigation'>
                  <span className='toggler-icon' />
                  <span className='toggler-icon' />
                  <span className='toggler-icon' />
                </button>
                <div
                  className='collapse navbar-collapse hidden lg:block duration-300 shadow absolute top-100 left-0 mt-full bg-white z-20 px-5 py-3 w-full lg:static lg:bg-transparent lg:shadow-none'
                  id='navbarSupportedContent'>
                  <ul className='navbar-nav mr-auto justify-center items-center lg:flex'>
                    <li className='nav-item'>
                      <a className='page-scroll' href='/#heading-on-deck'>
                        Home
                      </a>
                    </li>
                    <li className='nav-item'>
                      <a className='page-scroll' href='/#heading-last-updated'>
                        Last Updated
                      </a>
                    </li>
                    <li className='nav-item'>
                      <a className='page-scroll' href='/#heading-genre-0'>
                        Discover
                      </a>
                    </li>
                    <li className='nav-item'>
                      <a className='page-scroll' href='/#heading-all'>
                        All Series
                      </a>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </div>
          {/* Navbar End */}
        </header>
        {/* Header Area wrapper End */}
        <Outlet />
        {/* Footer Section Start */}
        <footer id='footer' className='bg-gray-800 py-16'>
          <div className='container'>
            <div className='flex flex-wrap'>
              <div className='w-full sm:w-1/2 md:w-1/2 lg:w-1/4 wow fadeInUp' data-wow-delay='0.2s'>
                <div className='mx-3 mb-8'>
                  <div className='footer-logo mb-3'>
                    <img src='assets/img/logo.svg' alt='' />
                  </div>
                  <p className='text-gray-300'>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam excepturi quasi, ipsam
                    voluptatem.
                  </p>
                </div>
              </div>
              {/* <div className='w-full sm:w-1/2 md:w-1/2 lg:w-1/4 wow fadeInUp' data-wow-delay='0.4s'>
                <div className='mx-3 mb-8'>
                  <h3 className='font-bold text-xl text-white mb-5'>Company</h3>
                  <ul>
                    <li>
                      <a href='#' className='footer-links'>
                        Press Releases
                      </a>
                    </li>
                    <li>
                      <a href='#' className='footer-links'>
                        Mission
                      </a>
                    </li>
                    <li>
                      <a href='#' className='footer-links'>
                        Strategy
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='w-full sm:w-1/2 md:w-1/2 lg:w-1/4 wow fadeInUp' data-wow-delay='0.6s'>
                <div className='mx-3 mb-8'>
                  <h3 className='font-bold text-xl text-white mb-5'>About</h3>
                  <ul>
                    <li>
                      <a href='#' className='footer-links'>
                        Career
                      </a>
                    </li>
                    <li>
                      <a href='#' className='footer-links'>
                        Team
                      </a>
                    </li>
                    <li>
                      <a href='#' className='footer-links'>
                        Clients
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='w-full sm:w-1/2 md:w-1/2 lg:w-1/4 wow fadeInUp' data-wow-delay='0.8s'>
                <div className='mx-3 mb-8'>
                  <h3 className='font-bold text-xl text-white mb-5'>Find us on</h3>
                  <ul className='social-icons flex justify-start'>
                    <li className='mx-2'>
                      <a href='#' className='footer-icon hover:bg-indigo-500'>
                        <i className='lni lni-facebook-original' aria-hidden='true' />
                      </a>
                    </li>
                    <li className='mx-2'>
                      <a href='#' className='footer-icon hover:bg-blue-400'>
                        <i className='lni lni-twitter-original' aria-hidden='true' />
                      </a>
                    </li>
                    <li className='mx-2'>
                      <a href='#' className='footer-icon hover:bg-red-500'>
                        <i className='lni lni-instagram-original' aria-hidden='true' />
                      </a>
                    </li>
                    <li className='mx-2'>
                      <a href='#' className='footer-icon hover:bg-indigo-600'>
                        <i className='lni lni-linkedin-original' aria-hidden='true' />
                      </a>
                    </li>
                  </ul>
                </div>
              </div> */}
            </div>
          </div>
        </footer>
        {/* Footer Section End */}
        <section className='bg-gray-800 py-6 border-t-2 border-gray-700 border-dotted'>
          <div className='container'>
            <div className='flex flex-wrap'>
              <div className='w-full text-center'>
                <p className='text-white'>
                  Designed and Developed by{' '}
                  <a
                    className='text-white duration-300 hover:text-blue-600'
                    href='https://tailwindtemplates.co'
                    rel='nofollow'>
                    TailwindTemplates
                  </a>{' '}
                  and{' '}
                  <a className='text-white duration-300 hover:text-blue-600' href='https://uideck.com' rel='nofollow'>
                    UIdeck
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
