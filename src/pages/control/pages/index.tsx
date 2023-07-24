import {Breadcrumb, Card, Col, Row, Statistic} from "antd";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {ArrowDownOutlined, ArrowUpOutlined} from "@ant-design/icons";
import {gqlDataProvider} from "../../../api";
import {useNavigation} from "@refinedev/core";
interface Props {
  rand?: any;
}

interface AnalyticsData {
  total_users: number;
  total_events: number;
  total_committees: number;
  total_departments: number;
  total_venues: number;
}

export const ControlHome: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const {push} = useNavigation();

  const getAnalytics = async () => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "get",
      meta: {
        operation: "analytics",
        variables: {},
        fields: ["data"],
      },
    })
      .catch(() => {
        return {data: null};
      })
      .then((data) => {
        return data;
      });

    if (data) {
      setAnalytics(data.data);
    }
    setLoading(false);
  };
  useEffect(() => {
    getAnalytics();
  }, []);

  return (
    <>
      <Breadcrumb
        separator=">"
        items={[
          {
            title: <Link to={"/control"}>Home</Link>,
          },
        ]}
      />

      <Row>
        <Col span={6}>
          <Link to={"/control/users"}>
            <Card bordered={true}>
              <Statistic
                title="Users"
                loading={loading}
                value={analytics?.total_users}
                precision={0}
                valueStyle={{color: "#3f8600"}}
                prefix={<ArrowUpOutlined />}
              />
            </Card>
          </Link>
        </Col>
        <Col span={6}>
          <Link to={"/control/departments"}>
            <Card bordered={true}>
              <Statistic
                title="Departments"
                loading={loading}
                value={analytics?.total_departments}
                precision={0}
                valueStyle={{color: "#3f8600"}}
                prefix={<ArrowUpOutlined />}
              />
            </Card>
          </Link>
        </Col>
        <Col span={6}>
          <Link to={"/control/committees"}>
            <Card bordered={true}>
              <Statistic
                title="Committees"
                loading={loading}
                value={analytics?.total_committees}
                precision={0}
                valueStyle={{color: "#3f8600"}}
                prefix={<ArrowUpOutlined />}
              />
            </Card>
          </Link>
        </Col>
        <Col span={6}>
          <Link to={"/control/meetings"}>
            <Card bordered={true}>
              <Statistic
                title="Events"
                loading={loading}
                value={analytics?.total_events}
                precision={0}
                valueStyle={{color: "#3f8600"}}
                prefix={<ArrowUpOutlined />}
              />
            </Card>
          </Link>
        </Col>
      </Row>
    </>
  );
};
