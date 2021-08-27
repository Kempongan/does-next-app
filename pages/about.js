import ATF from '@/components/ATF'
import Layout from '@/components/Layout'
import useContent from '@/helpers/use-content'
import Head from 'next/head'

export default function About() {
  const { site_title, nav_about } = useContent()

  return (
    <Layout>
      <Head>
        <title>
          {nav_about} - {site_title}
        </title>
      </Head>

      <ATF title={nav_about} imageURL={`/images/placeholder.png`} />

      <div className="container py-10 md:py-20">Lorem ipsum</div>
    </Layout>
  )
}
