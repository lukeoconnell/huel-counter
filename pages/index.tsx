import type { NextPage } from 'next'
import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { useTable } from 'react-table'
import styles from '../styles/Home.module.css'

const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateMyData, // This is a custom function that we supplied to our table instance
}: any) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue)

  const onChange = (e: any) => {
    setValue(e.target.value)
  }

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    updateMyData(index, id, value)
  }

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  return <input value={value} onChange={onChange} onBlur={onBlur} />
}

const defaultColumn = {
  Cell: EditableCell,
}

const Home: NextPage = () => {
  const [data, setData] = useState(JSON.stringify({ success: true, orders: [] }))
  const [items, setItems] = useState<Array<{ name: string, value: number, count: number }>>([])
  const [sum, setSum] = useState(0)

  const onDataChange = (data: any) => setData(data.target.value)

  useEffect(() => {
    let newSum = 0
    items.forEach(item => newSum += item.value * item.count)

    setSum(newSum)

    console.log(`Calculated Sum: ${newSum}`)
  }, [items])

  useEffect(() => {
    const { orders } = JSON.parse(data)

    const items = []

    for (let order of orders) {
      for (let item of order.line_items) {
        const name: string = item.title
          .replace(/ \(Subscription\)/g, '')
          .replace(/ v\d\.\d/g, '')

        const excludes = ['Shaker Bottle', 'T-Shirt', 'Flavour Boost', 'Huel Shaker', 'Literature', 'Scoop', 'Huel Handbook']

        if (excludes.some((exclude) => name.includes(exclude))) {
          continue
        }

        items.push({
          quantity: item.quantity,
          name: name
        })
      }
    }

    const unique = [...Array.from(new Set(items.map(item => item.name)))]
      .map(item => {
        let value = 0

        if (item.includes('Ready-to-drink')) value = 12
        else if (item.includes('Powder')) value = 17
        else if (item.includes('Granola')) value = 7
        else if (item.includes('Black Edition')) value = 17
        else if (item.includes(' Pot')) value = 0
        else if (item.includes('Huel Bar')) value = 15
        else value = 17

        return {
          name: item,
          value,
          count: 0
        }
      })

    items.forEach(item => {
      unique.find(test => test.name === item.name)!.count += item.quantity
    })

    setItems(unique)
  }, [data])

  const columns = useMemo(() => [
    {
      Header: 'Product Name',
      accessor: 'name'
    },
    {
      Header: 'Meals per Item',
      accessor: 'value'
    },
    {
      Header: 'Number Ordered',
      accessor: 'count'
    }
  ], [])

  const updateMyData = (rowIndex: number, columnId: 'name' | 'value' | 'count', value: any) => {
    setItems(old =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          }
        }
        return row
      })
    )
  }

  const tableInstance = useTable({ columns: columns, data: items, defaultColumn, updateMyData: updateMyData } as any)
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance

  return (
    <div className={styles.container}>
      <Head>
        <title>Huel Calculator</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Huel Calculator
        </h1>

        <p>Calculate how many orders you&apos;ve purchased through Huel. To use:</p>
        <ol>
          <li>Go to your order history (e.g. <a href="https://uk.huel.com/account#/history">https://uk.huel.com/account#/history</a>)</li>
          <li>Open your developer console (instructions <a href="https://support.airtable.com/hc/en-us/articles/232313848-How-to-open-the-developer-console">https://support.airtable.com/hc/en-us/articles/232313848-How-to-open-the-developer-console</a>)</li>
          <li>Copy the &apos;orders&apos; response from the &apos;Network&apos; tab and copy it into the box below.</li>
        

        <Image src="/example.png" alt="example flow" width={885} height={512} />

          <li>Paste it down below, it should start like &#123;&quot;success&quot;: true, &quot;orders: [...]&quot;&#125;</li>

        </ol>

        <p className={styles.description}>
          <textarea value={data} onChange={onDataChange} style={{ width: "500px", height: "100px" }} />
        </p>

        {items.length !== 0 &&

        <><table {...getTableProps()}>
          <thead>
            {// Loop over the header rows
            headerGroups.map(headerGroup => (
              // Apply the header row props
              <tr {...headerGroup.getHeaderGroupProps()}>
                {// Loop over the headers in each row
                headerGroup.headers.map(column => (
                  // Apply the header cell props
                  <th {...column.getHeaderProps()}>
                    {// Render the header
                    column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Apply the table body props */}
          <tbody {...getTableBodyProps()}>
            {// Loop over the table rows
            rows.map(row => {
              // Prepare the row for display
              prepareRow(row)

              return (
                // Apply the row props
                <tr {...row.getRowProps()}>
                  {// Loop over the rows cells
                  row.cells.map(cell => {
                    // Apply the cell props
                    return (
                      <td {...cell.getCellProps()}>
                        {// Render the cell contents
                        cell.render('Cell')}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>

          <h1>Sum: {sum}</h1>
        </>}
      </main>
    </div>
  )
}

export default Home
