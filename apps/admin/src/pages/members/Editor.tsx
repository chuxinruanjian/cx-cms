import { useAccess, useIntl } from '@umijs/max';
import { App, Form, Input, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { AvatarUploader } from '@/components/Uploader';
import { getAvatarText } from '@/utils/avatar';
import { type Member, updateMember } from './service';

export default function Editor({
  member,
  onClose,
  onSaved,
}: {
  member?: Member;
  onClose: () => void;
  onSaved: (member: Member) => void;
}) {
  const intl = useIntl();
  const access = useAccess();
  const { message } = App.useApp();
  const t = (key: string) => intl.formatMessage({ id: `members.${key}` });
  const [form] = Form.useForm<{
    nickname: string | null;
    avatar: string | null;
  }>();
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    form.resetFields();
    if (member)
      form.setFieldsValue({ nickname: member.nickname, avatar: member.avatar });
  }, [member, form]);
  return (
    <Modal
      open={Boolean(member)}
      title={t('edit')}
      forceRender
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={saving}
      okText={t('save')}
      cancelText={t('cancel')}
      closable={!saving}
      mask={{ closable: !saving }}
      cancelButtonProps={{ disabled: saving }}
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        onFinish={async (values) => {
          if (!member) return;
          setSaving(true);
          try {
            const updated = await updateMember(member.id, {
              nickname: values.nickname || null,
              ...(access.canUploadFiles
                ? { avatar: values.avatar || null }
                : {}),
            });
            message.success(t('saved'));
            onSaved(updated);
            onClose();
          } catch {
            /* Shared request handler displays errors; keep the form open. */
          } finally {
            setSaving(false);
          }
        }}
      >
        <Form.Item name="nickname" label={t('nickname')}>
          <Input maxLength={100} />
        </Form.Item>
        {access.canUploadFiles && (
          <Form.Item name="avatar" label={t('avatar')}>
            <AvatarUploader
              fallbackText={getAvatarText(
                member?.nickname || member?.username || '',
              )}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
