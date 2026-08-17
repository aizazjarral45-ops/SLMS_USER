import { Tag, Button, Space } from "antd";
export const Columndata = () => {
  return [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: "10%",
    },
    {
      title: "Expense Title",
      dataIndex: "title",
      key: "title",
      width: "30%",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: "20%",
      render: (_, { tags }) => (
        <Space size="small" wrap>
          {tags.map((tag) => {
            let color = tag.length > 5 ? "geekblue" : "green";
            if (tag === "kawaii") {
              color = "volcano";
            }
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </Space>
      ),
    },
    {
      title: "Payment",
      dataIndex: "payment",
      key: "payment",
      width: "20%",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: "10%",
    },

    {
      title: "Action",
      key: "action",
      width: "10%",
      render: () => (
        <div style={{ display: "flex" }}>
          <Button type="link">View </Button>
          <Button type="link">Delete</Button>
        </div>
      ),
    },
  ];
};
