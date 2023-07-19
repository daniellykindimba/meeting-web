import {useGetIdentity, useNavigation} from "@refinedev/core";
import {
  Breadcrumb,
  Button,
  Col,
  Dropdown,
  Empty,
  Form,
  Grid,
  Input,
  MenuProps,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
} from "antd";
import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {
  BlockOutlined,
  DeleteFilled,
  DownOutlined,
  EditFilled,
  FolderAddOutlined,
  LockOutlined,
  MenuUnfoldOutlined,
  UnlockOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {EventData, UserData} from "../../../../interfaces";
import events from "events";
import {gqlDataProvider} from "../../../../api";
import {CreateUserForm} from "./forms/create_user_form";

interface Props {
  rand?: any;
}

export const UsersPage: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [members, setMembers] = useState<UserData[]>([]);
  const [member, setMember] = useState<UserData | null>(null);
  const [createMemberModal, setCreateMemberModal] = useState(false);
  const {data: user} = useGetIdentity<UserData>();

  const {push} = useNavigation();
  const breakpoint = Grid.useBreakpoint();
  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  const getMembers = async (key = "", page = 1, pageSize = 25) => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "get",
      meta: {
        operation: "users",
        variables: {},
        fields: [
          "total",
          "page",
          "pages",
          {
            results: [
              "id",
              "id",
              "email",
              "phone",
              "firstName",
              "middleName",
              "lastName",
              "avatar",
              "isActive",
            ],
          },
        ],
      },
    })
      .catch(() => {
        return {data: null};
      })
      .then((data) => {
        return data;
      });

    if (data) {
      setMembers(data.results);
      setTotal(data.total);
      setPage(data.page);
      setLimit(pageSize);
    }
    setLoading(false);
  };

  const columns = [
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      render: (text: string, record: UserData) => <>{record.firstName}</>,
    },
    {
      title: "Middle Name",
      dataIndex: "middleName",
      key: "middleName",
      render: (text: string, record: UserData) => <>{record.middleName}</>,
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      render: (text: string, record: UserData) => <>{record.lastName}</>,
    },
    {
      title: "Email Address",
      dataIndex: "email",
      key: "email",
      render: (text: string, record: UserData) => <>{record.email}</>,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (text: string, record: UserData) => <>{record.phone}</>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string, record: UserData) => (
        <>
          {record.isActive ? (
            <Tag color="green">Active</Tag>
          ) : (
            <Tag color="red">Blocked</Tag>
          )}
        </>
      ),
    },
    {
      title: <div style={{float: "right"}}>Action(s)</div>,
      dataIndex: "actions",
      key: "actions",
      render: (text: string, record: UserData) => (
        <div style={{float: "right"}}>{getEventDropdownMenue(record)}</div>
      ),
    },
  ];

  const getEventDropdownMenue = (member: UserData) => {
    const items: MenuProps["items"] = [
      {
        key: "edituser",
        label: <Button type="link">Edit</Button>,
        icon: <EditFilled />,
        disabled: true,
      },
      {
        key: "deleteuser",
        label: (
          <Popconfirm
            title="Delete the User"
            description="Are you sure to delete this User?"
            onConfirm={() => {
              console.log("deleting");
            }}
            onCancel={() => {
              console.log("deleting");
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        ),
        disabled: true,
        icon: <DeleteFilled />,
      },
      {
        key: "blockUnblockUser",
        label: (
          <Popconfirm
            title={
              member.isActive
                ? "Are you sure to block this user?"
                : "Are you sure to unblock this user?"
            }
            description={member.isActive ? "Are you sure" : "Are you sure"}
            onConfirm={() => {
              console.log("block");
            }}
            onCancel={() => {
              console.log("unblock");
            }}
            okText={member.isActive ? "Block" : "Unblock"}
            cancelText="No"
          >
            <Button type="link" danger={member.isActive}>
              {member.isActive ? "Block" : "Unblock"}
            </Button>
          </Popconfirm>
        ),
        icon: member.isActive ? <LockOutlined /> : <UnlockOutlined />,
      },
    ];

    return (
      <Dropdown menu={{items}} trigger={["click"]} placement="bottomRight">
        <a onClick={(e) => e.preventDefault()}>
          <Space>
            <MenuUnfoldOutlined />
          </Space>
        </a>
      </Dropdown>
    );
  };

  const handleCreateFinish = async (member: UserData) => {
    setMembers([member, ...members]);
    setCreateMemberModal(false);
  };

  useEffect(() => {
    // check if user is admin
    if (!user?.isAdmin) {
      push("/");
    }
    getMembers("", 1, 12);
  }, []);

  return (
    <>
      <Breadcrumb
        separator=">"
        items={[
          {
            title: <Link to={"/control"}>Home</Link>,
          },
          {
            title: "Members",
          },
        ]}
      />

      <Row>
        <Col span={14}>
          <Form
            name="basic"
            onFinish={(values) => {
              getMembers(values.q, 1, limit);
            }}
            autoComplete="off"
          >
            <Form.Item
              name="q"
              rules={[{required: false, message: "Search Users!"}]}
            >
              <Input
                size="large"
                type="search"
                placeholder="Search ...."
                allowClear
              />
            </Form.Item>
          </Form>
        </Col>

        <Col span={10} style={{display: "flex", justifyContent: "flex-end"}}>
          <Button
            size="large"
            icon={<UserAddOutlined />}
            onClick={() => setCreateMemberModal(true)}
            type="primary"
          >
            Create New User
          </Button>
        </Col>
      </Row>

      <Table dataSource={members} columns={columns} />

      <Modal
        title="Create New User"
        open={createMemberModal}
        destroyOnClose={true}
        width={"50vw"}
        onOk={() => setCreateMemberModal(false)}
        onCancel={() => setCreateMemberModal(false)}
        footer={[]}
      >
        <CreateUserForm onFinish={handleCreateFinish} />
      </Modal>
    </>
  );
};
