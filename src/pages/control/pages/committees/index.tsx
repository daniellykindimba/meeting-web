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
  message,
} from "antd";
import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {
  DeleteFilled,
  EditFilled,
  LockOutlined,
  MenuUnfoldOutlined,
  OrderedListOutlined,
  UnlockOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {CommitteeData, DepartmentData, UserData} from "../../../../interfaces";
import {gqlDataProvider} from "../../../../api";
import moment from "moment";
import {CreateCommitteeForm} from "./forms/create_committee_form";
import {CommitteeMembersListComponent} from "./members";

interface Props {
  rand?: any;
}

export const CommitteesPage: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [committees, setCommittees] = useState<CommitteeData[]>([]);
  const [committee, setCommittee] = useState<CommitteeData | null>(null);
  const [createCommmitteeModal, setCreateCommitteeModal] = useState(false);
  const [committeeMembersModal, setCommitteeMembersModal] = useState(false);
  const {data: user} = useGetIdentity<UserData>();

  const {push} = useNavigation();
  const breakpoint = Grid.useBreakpoint();
  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  const getCommittees = async (key = "", page = 1, pageSize = 25) => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "get",
      meta: {
        operation: "committees",
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
      setCommittees(data.results);
      setTotal(data.total);
      setPage(data.page);
      setLimit(pageSize);
    }
    setLoading(false);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
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
        <div style={{float: "right"}}>{getCommitteeDropdownMenue(record)}</div>
      ),
    },
  ];

  const getCommitteeDropdownMenue = (committee: CommitteeData) => {
    const items: MenuProps["items"] = [
      {
        key: "viewCommitteeMembers",
        label: <Button type="link">Members</Button>,
        icon: <OrderedListOutlined />,
        onClick: () => {
          setCommittee(committee);
          setCommitteeMembersModal(true);
        },
      },
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
              committee.isActive
                ? "Are you sure to block this user?"
                : "Are you sure to unblock this user?"
            }
            description={committee.isActive ? "Are you sure" : "Are you sure"}
            onConfirm={() => {
              console.log("block");
            }}
            onCancel={() => {
              console.log("unblock");
            }}
            okText={committee.isActive ? "Block" : "Unblock"}
            cancelText="No"
          >
            <Button type="link" danger={committee.isActive}>
              {committee.isActive ? "Block" : "Unblock"}
            </Button>
          </Popconfirm>
        ),
        icon: committee.isActive ? <LockOutlined /> : <UnlockOutlined />,
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

  const handleOnCreateFinish = async (committee: CommitteeData) => {
    setCommittees([committee, ...committees]);
    setCreateCommitteeModal(false);
  };

  useEffect(() => {
    // check if user is admin
    if (!user?.isAdmin) {
      push("/");
    }
    getCommittees("", 1, 12);
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
              getCommittees(values.q, 1, limit);
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
            onClick={() => setCreateCommitteeModal(true)}
            type="primary"
          >
            Create New Committee
          </Button>
        </Col>
      </Row>

      <Table dataSource={committees} columns={columns} />

      <Modal
        title="Create New Committee"
        open={createCommmitteeModal}
        destroyOnClose={true}
        width={"50vw"}
        onOk={() => setCreateCommitteeModal(false)}
        onCancel={() => setCreateCommitteeModal(false)}
        footer={[]}
      >
        <CreateCommitteeForm onFinish={handleOnCreateFinish} />
      </Modal>

      <Modal
        title={committee?.name + " Members"}
        open={committeeMembersModal}
        destroyOnClose={true}
        width={"50vw"}
        onOk={() => setCommitteeMembersModal(false)}
        onCancel={() => setCommitteeMembersModal(false)}
        footer={[]}
      >
        <CommitteeMembersListComponent
          committee={committee}
          onFinish={handleOnCreateFinish}
        />
      </Modal>
    </>
  );
};
