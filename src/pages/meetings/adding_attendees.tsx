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
  Popconfirm,
  Row,
  Select,
  SelectProps,
} from "antd";
import {useEffect, useState} from "react";
import {gqlDataProvider} from "../../api";
import {
  UserData,
  EventData,
  EventAttendeeData,
  DepartmentData,
} from "../../interfaces";

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
  event?: EventData | null;
}

const options: SelectProps["options"] = [];

export const AddingMeetingAttendeesComponent: React.FC<Props> = (
  props: Props
) => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
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
        operation: "eventAttendeesToAdd",
        variables: {
          eventId: {
            value: props.event?.id,
            required: true,
            type: "Int",
          },
          departmentIds: {
            value: departmentIds,
            required: false,
            type: "[Int]",
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

  const addEventAttendee = async (attendeeId: number) => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "post",
      meta: {
        operation: "addEventAttendee",
        variables: {
          eventId: {
            value: props.event?.id,
            required: true,
            type: "Int",
          },
          attendeeId: {
            value: attendeeId,
            required: true,
            type: "Int",
          },
        },
        fields: [
          "success",
          "message",
          {
            eventAttendee: [
              "id",
              {
                event: ["id"],
              },
              {
                attendee: [
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
      setMembers(members.filter((member) => member.id !== attendeeId));
      props.onFinish(data.eventAttendee);
    }
    setLoading(false);
  };

  const handleChange = (value: string[]) => {
    setSelectedDepartments(value.map((v) => parseInt(v)));
    getMembersToAdd(
      "",
      1,
      limit,
      value.map((v) => parseInt(v))
    );
  };

  useEffect(() => {
    getMembersToAdd();
    getDepartments();
  }, []);

  return (
    <>
      <Row>
        <Col span={10}>
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

        <Col span={8}>
          <Select
            size="large"
            mode="multiple"
            allowClear
            style={{width: "100%"}}
            placeholder="Please select Department"
            defaultValue={[]}
            onChange={handleChange}
            options={departments.map((department) => {
              return {
                label: department.name,
                value: department.id,
              };
            })}
          />
        </Col>
        <Col span={6}>
          <Button
            icon={<SearchOutlined />}
            size="large"
            onClick={() => {
              getMembersToAdd(
                "",
                1,
                limit,
                selectedDepartments.map((v) => parseInt(v))
              );
            }}
            loading={loading}
            disabled={loading}
          ></Button>
        </Col>
      </Row>
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
                  addEventAttendee(member.id);
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
    </>
  );
};
