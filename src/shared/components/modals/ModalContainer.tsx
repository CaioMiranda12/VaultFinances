import TransactionModal from "./TransactionModal";
import ConfirmModal from "./ConfirmModal";
import { useTransactions } from "@/store/TransactionContext";
import { useCategories } from "@/store/CategoryContext";


export default function ModalContainer() {
  const { modal, closeModal, deleteTransaction } = useTransactions();
  const { categoryModal, closeCategoryModal, deleteCategory } = useCategories();

  return (
    <>
      {/* Add / edit transaction */}
      <TransactionModal />

      {/* Delete transaction confirmation */}
      <ConfirmModal
        isOpen={modal?.type === "delete"}
        title="Excluir Transacao"
        message={
          modal?.type === "delete"
            ? `Deseja excluir "${modal.transaction.descricao || modal.transaction.categoria}"? Esta acao nao pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        onConfirm={() => {
          if (modal?.type === "delete") deleteTransaction(modal.transaction.id);
          closeModal();
        }}
        onCancel={closeModal}
      />

      {/* Delete category confirmation */}
      <ConfirmModal
        isOpen={categoryModal?.type === "delete"}
        title="Excluir Categoria"
        message={
          categoryModal?.type === "delete"
            ? `Deseja excluir a categoria "${categoryModal.category.nome}"?`
            : ""
        }
        confirmLabel="Excluir"
        onConfirm={() => {
          if (categoryModal?.type === "delete") deleteCategory(categoryModal.category.id);
          closeCategoryModal();
        }}
        onCancel={closeCategoryModal}
      />
    </>
  );
}
