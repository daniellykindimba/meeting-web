import {
  FolderAddOutlined,
  PlusCircleFilled,
  SearchOutlined,
} from "@ant-design/icons";
import {useGetIdentity} from "@refinedev/core";
import {
  Avatar,
  Button,
  Col,
  Drawer,
  Form,
  Input,
  List,
  Pagination,
  Popconfirm,
  Row,
  Select,
  SelectProps,
} from "antd";
import {useEffect, useState} from "react";
import {
  CommitteeData,
  DepartmentData,
  UserData,
} from "../../../../../interfaces";
import {gqlDataProvider} from "../../../../../api";

const {TextArea} = Input;

const {Option} = Select;

interface formData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  venueId: number;
}

interface Props {
  onFinish: any;
  committee?: CommitteeData | null;
}

const options: SelectProps["options"] = [];

export const AddingCommitteesMembersComponent: React.FC<Props> = (
  props: Props
) => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState("");
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [members, setMembers] = useState<UserData[]>([]);
  const [addingAttendeeModal, setAddingAttendeeModal] = useState(false);
  const [form] = Form.useForm<formData>();
  const {data: user} = useGetIdentity<UserData>();
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);

  const getDepartments = async (key = "", page = 1, pageSize = 25) => {
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
            results: ["id", "name", "description"],
          },
        ],
      },
    })
      .catch((error) => {
        console.error(error);
        return {data: null};
      })
      .then((data) => {
        return data;
      });
    console.log(data);
    if (data) {
      setDepartments(data.results);
    }
  };

  const getMembersToAdd = async (
    key = "",
    page = 1,
    pageSize = 25,
    departmentIds: number[] = []
  ) => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "get",
      meta: {
        operation: "notCommitteeMembers",
        variables: {
          id: {
            value: props.committee?.id,
            required: true,
            type: "Int",
          },
          key: {
            value: key,
            required: false,
            type: "String",
          },
          page: {
            value: page,
            required: false,
            type: "Int",
          },
          pageSize: {
            value: pageSize,
            required: false,
            type: "Int",
          },
        },
        fields: [
          "total",
          "page",
          "pages",
          {
            results: [
              "id",
              "email",
              "phone",
              "firstName",
              "middleName",
              "lastName",
              "avatar",
            ],
          },
        ],
      },
    })
      .catch((error) => {
        console.error(error);
        return {data: null};
      })
      .then((data) => {
        return data;
      });
    if (data) {
      setMembers(data.results);
      setTotal(data.total);
      setPage(data.page);
    }
    setLoading(false);
  };

  const addMember = async (id: number) => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "post",
      meta: {
        operation: "addCommitteeMember",
        variables: {
          committeeId: {
            value: props.committee?.id,
            required: true,
            type: "Int",
          },
          userId: {
            value: id,
            required: true,
            type: "Int",
          },
        },
        fields: [
          "success",
          "message",
          {
            committeeMember: [
              "id",
              {
                committee: ["id"],
              },
              {
                user: [
                  "id",
                  "email",
                  "phone",
                  "firstName",
                  "middleName",
                  "lastName",
                  "avatar",
                ],
              },
            ],
          },
        ],
      },
    })
      .catch((error) => {
        console.error(error);
        return {data: null};
      })
      .then((data) => {
        return data;
      });
    if (data) {
      setMembers(members.filter((member) => member.id !== id));
      props.onFinish(data.committeeMember);
    }
    setLoading(false);
  };

  useEffect(() => {
    getMembersToAdd();
  }, []);

  return (
    <>
      <Row>
        <Col span={16}>
          <Form
            name="basic"
            onFinish={(values) => {
              getMembersToAdd(values.q, 1, limit);
            }}
            autoComplete="off"
          >
            <Form.Item
              name="q"
              rules={[{required: false, message: "Search Members!"}]}
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
      </Row>
      <div
        style={{
          maxHeight: "78vh",
          minHeight: "78vh",
          overflowY: "scroll",
          overflowX: "hidden",
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={members}
          renderItem={(member, index) => (
            <List.Item
              actions={[
                <Popconfirm
                  title="Are you sure to add this user to the meeting?"
                  description="Are you sure?"
                  onConfirm={() => {
                    addMember(member.id);
                  }}
                  onCancel={() => {
                    console.log("adding");
                  }}
                  okText="Add"
                  cancelText="No"
                >
                  <Button icon={<PlusCircleFilled />}></Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${index}`}
                  />
                }
                title={
                  <a href="https://ant.design">
                    {member.firstName +
                      " " +
                      member.middleName +
                      " " +
                      member.lastName}
                  </a>
                }
                description={member.email + " ===> " + member.phone}
              />
            </List.Item>
          )}
        />
      </div>

      <div style={{marginTop: 10, display: "flex", justifyContent: "center"}}>
        <Pagination
          defaultCurrent={page}
          total={total}
          onChange={(page, pageSize) => {
            getMembersToAdd(key, page, pageSize as number);
          }}
        />
      </div>
    </>
  );
};
