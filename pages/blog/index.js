import Link from 'next/link'
import ATF from '@/components/ATF'
import Button from '@/components/Button'
import Layout from '@/components/Layout'
import { useCallback, useEffect, useState } from 'react'
import useContent from '@/helpers/use-content'
import PostCards from '@/components/PostCards'
import PopularPosts from '@/components/PopularPosts'
import UnderlinedTitle from '@/components/UnderlinedTitle'
import { POPULAR_POST_LENGTH } from '@/constants'
import dayjs from 'dayjs'

const LIMIT = 6
const WITH_INFINITE_SCROLL = false

/* @TODO: remove hard-coded category id */
const POPULAR_CATEGORY_ID = 1 // 1 = popular

export default function Blog() {
  const {
    label_show_more,
    nav_blog,
    label_no_more_post,
    site_fetching,
    label_popular_post,
    label_latest_post,
    site_no_data
  } = useContent()
  const [posts, setPosts] = useState(null)
  const [popularPosts, setPopularPosts] = useState(null)
  const [offset, setOffset] = useState(0)
  const [canShowMore, setCanShowMore] = useState(true)
  const [isFetching, setIsFetching] = useState(false)

  const fetcher = useCallback(
    (callback) => {
      setIsFetching(true)
      fetch(`/api/blog?limit=${LIMIT}&offset=${offset}`)
        .then((res) => res.json())
        .then((res) => {
          if (callback) callback(res)
        })
        .catch((err) => {
          console.log(err)
          setPosts(undefined)
        })
        .finally(() => setIsFetching(false))
    },
    [offset]
  )

  useEffect(() => {
    if (isFetching || posts !== null) return

    fetcher((res) => {
      if (res.data) {
        const sorted = res.data.sort((a, b) => dayjs(a.date).isAfter(b.date))
        setPosts(sorted)
        setOffset(offset + LIMIT)
      } else {
        setPosts(undefined)
      }
      if (!res.next) {
        setCanShowMore(false)
      }
    })
  }, [isFetching, offset, posts, fetcher])

  useEffect(() => {
    if (!posts || posts === null || posts.length === 0) return

    let additionalPosts = []
    let newPopularPosts = posts.filter((post) => {
      if (post.categories.includes(POPULAR_CATEGORY_ID)) return
      additionalPosts.push(post)
    })

    if (newPopularPosts.length < POPULAR_POST_LENGTH) {
      let remaining = POPULAR_POST_LENGTH - newPopularPosts.length
      let additionals = additionalPosts.slice(0, remaining)
      newPopularPosts = [...newPopularPosts, ...additionals]
    }

    setPopularPosts(newPopularPosts)
  }, [posts])

  const handleShowMore = () => {
    if (isFetching === false) {
      fetcher((res) => {
        if (res.data) {
          const newPosts = [...posts, ...res.data]
          const sorted = newPosts.sort((a, b) => dayjs(a.date).isAfter(b.date))
          setPosts(sorted)
          setOffset(offset + LIMIT)
        }
        if (!res.next) {
          setCanShowMore(false)
        }
      })
    }
  }

  return (
    <Layout>
      <ATF title={nav_blog} />

      <div className="container">
        <div className="py-10 md:py-20 lg:py-40">
          <UnderlinedTitle text1={label_popular_post} lineBold BigText />
          <PopularPosts
            data={popularPosts}
            extendClass={'mt-4 md:mt-10 lg:mt-20'}
          />
        </div>

        <UnderlinedTitle text1={label_latest_post} lineBold BigText />

        {!posts || posts === null ? (
          <>{site_no_data}</>
        ) : (
          <PostCards posts={posts} />
        )}

        {WITH_INFINITE_SCROLL ? (
          <div className="flex justify-center mb-40">
            {canShowMore ? (
              <>
                {isFetching ? (
                  <p className="italic opacity-50">{site_fetching}</p>
                ) : (
                  <Button outline onClick={handleShowMore}>
                    {label_show_more}
                  </Button>
                )}
              </>
            ) : (
              <p className="italic opacity-50">{label_no_more_post}</p>
            )}
          </div>
        ) : (
          <div className="flex justify-center mb-40">
            <Link href="/blog/listing">
              <a>
                <Button outline>{label_show_more}</Button>
              </a>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  )
}
