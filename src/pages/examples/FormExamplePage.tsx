import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormDrawer } from "@/components/shared/FormDrawer";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { SummaryPanel } from "@/components/shared/SummaryPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(2, "请输入资源名称"),
  region: z.string().min(1, "请选择区域"),
  type: z.string().min(1, "请选择规格"),
  owner: z.string().email("请输入负责人邮箱"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function FormExamplePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "api-gateway-01",
      region: "hk",
      type: "standard",
      owner: "admin@nax.local",
      description: "生产网关服务，用于外部流量入口。",
    },
  });
  const values = form.watch();

  return (
    <PageContainer>
      <PageHeader
        title="创建资源"
        description="使用标准表单创建服务器或服务资源"
        actions={
          <Button onClick={() => setDrawerOpen(true)}>打开抽屉表单</Button>
        }
      />
      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <div className="font-semibold">基础信息</div>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-5"
              onSubmit={form.handleSubmit(() => setDrawerOpen(true))}
            >
              <div className="grid gap-2">
                <Label>资源名称</Label>
                <Input {...form.register("name")} />
                <FieldError message={form.formState.errors.name?.message} />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>区域</Label>
                  <Select
                    value={values.region}
                    onValueChange={(value) =>
                      form.setValue("region", value, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择区域" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hk">香港 HK</SelectItem>
                      <SelectItem value="sg">新加坡 SG</SelectItem>
                      <SelectItem value="la">洛杉矶 LA</SelectItem>
                      <SelectItem value="jp">东京 JP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError message={form.formState.errors.region?.message} />
                </div>
                <div className="grid gap-2">
                  <Label>规格</Label>
                  <Select
                    value={values.type}
                    onValueChange={(value) =>
                      form.setValue("type", value, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择规格" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="pro">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError message={form.formState.errors.type?.message} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>负责人</Label>
                <Input {...form.register("owner")} />
                <FieldError message={form.formState.errors.owner?.message} />
              </div>
              <div className="grid gap-2">
                <Label>描述</Label>
                <Textarea {...form.register("description")} />
              </div>
              <div className="flex justify-end gap-2 border-t pt-5">
                <Button variant="secondary" type="button">
                  取消
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4" />
                  保存配置
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <SummaryPanel
          title="创建摘要"
          items={[
            { label: "名称", value: values.name || "-" },
            { label: "区域", value: values.region || "-" },
            { label: "规格", value: values.type || "-" },
            { label: "负责人", value: values.owner || "-" },
          ]}
        />
      </div>
      <FormDrawer
        open={drawerOpen}
        title="抽屉表单"
        description="用于侧向编辑场景，适合轻量资源配置。"
        onClose={() => setDrawerOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              取消
            </Button>
            <Button onClick={() => setDrawerOpen(false)}>保存</Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <Input placeholder="资源别名" />
          <Input placeholder="通知邮箱" />
          <Textarea placeholder="变更说明" />
        </div>
      </FormDrawer>
    </PageContainer>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <div className="text-xs text-red-600">{message}</div> : null;
}
