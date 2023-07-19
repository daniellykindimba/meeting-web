import {useGetIdentity, useNavigation} from "@refinedev/core";
import {
  Breadcrumb,
  Button,
  Col,
  Dropdown,
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
  DeleteFilled,
  EditFilled,
  LockOutlined,
  MenuUnfoldOutlined,
  UnlockOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {DepartmentData, UserData} from "../../../../interfaces";
import {gqlDataProvider} from "../../../../api";
import {CreateDepartmentForm} from "./forms/create_department_form";
import moment from "moment";

interface Props {
  rand?: any;
}

export const DepartmentsPage: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [department, setDepartment] = useState<DepartmentData | null>(null);
  const [createDepartmentModal, setCreateDepartmentModal] = useState(false);
  const {data: user} = useGetIdentity<UserData>();

  const {push} = useNavigation();
  const breakpoint = Grid.useBreakpoint();
  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  const getDepartments = async (key = "", page = 1, pageSize = 25) => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "get",
      meta: {
        operation: "departments",
        variables: {},
        fields: [
          "total",
          "page",
          "pages",
          {
            results: [
              "id",
              "name",
              "description",
              "created",
              "updated",
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
      setDepartments(data.results);
      setTotal(data.total);
      setPage(data.page);
      setLimit(pageSize);
    }
    setLoading(false);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "firstName",
      key: "firstName",
      render: (text: string, record: DepartmentData) => <>{record.name}</>,
    },
    {
      title: "Created",
      dataIndex: "created",
      key: "created",
      render: (text: string, record: DepartmentData) => (
        <>{moment(record.created).format("DD/MM/YYYY")}</>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string, record: DepartmentData) => (
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
      render: (text: string, record: DepartmentData) => (
        <div style={{float: "right"}}>{getEventDropdownMenue(record)}</div>
      ),
    },
  ];

  const getEventDropdownMenue = (department: DepartmentData) => {
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
        key: "blockUnblockDepartment",
        label: (
          <Popconfirm
            title={
              department.isActive
                ? "Are you sure to block this user?"
                : "Are you sure to unblock this user?"
            }
            description={department.isActive ? "Are you sure" : "Are you sure"}
            onConfirm={() => {
              console.log("block");
            }}
            onCancel={() => {
              console.log("unblock");
            }}
            okText={department.isActive ? "Block" : "Unblock"}
            cancelText="No"
          >
            <Button type="link" danger={department.isActive}>
              {department.isActive ? "Block" : "Unblock"}
            </Button>
          </Popconfirm>
        ),
        icon: department.isActive ? <LockOutlined /> : <UnlockOutlined />,
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

  const handleOnCreateFinish = async (department: DepartmentData) => {
    setDepartments([department, ...departments]);
    setCreateDepartmentModal(false);
  };

  useEffect(() => {
    // check if user is admin
    if (!user?.isAdmin) {
      push("/");
    }
    getDepartments("", 1, 12);
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
              getDepartments(values.q, 1, limit);
            }}
            autoComplete="off"
          >
            <Form.Item
              name="q"
              rules={[{required: false, message: "Search Departments!"}]}
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
            onClick={() => setCreateDepartmentModal(true)}
            type="primary"
          >
            Create New Department
          </Button>
        </Col>
      </Row>

      <Table dataSource={departments} columns={columns} />

      <Modal
        title="Create New Department"
        open={createDepartmentModal}
        destroyOnClose={true}
        width={"50vw"}
        onOk={() => setCreateDepartmentModal(false)}
        onCancel={() => setCreateDepartmentModal(false)}
        footer={[]}
      >
        <CreateDepartmentForm onFinish={handleOnCreateFinish} />
      </Modal>
    </>
  );
};
