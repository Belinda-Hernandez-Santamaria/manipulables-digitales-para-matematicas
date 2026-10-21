function showModal(title, bodyHtml, onOk = null, onCancel = null, okText="Aceptar", cancelText="Cancelar") {
            const container = document.getElementById('modal-container');
            container.classList.remove('hidden');
            document.getElementById('modal-title-text').innerHTML = title;
            document.getElementById('modal-body').innerHTML = bodyHtml;

            const btnOk = document.getElementById('modal-btn-ok');
            const btnCancel = document.getElementById('modal-btn-cancel');
            const btnClose = document.getElementById('modal-btn-close-icon');

            let newBtnOk = btnOk.cloneNode(true); btnOk.parentNode.replaceChild(newBtnOk, btnOk);
            newBtnOk.innerText = okText;
            let newBtnCancel = btnCancel.cloneNode(true); btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);
            newBtnCancel.innerText = cancelText;
            let newBtnClose = btnClose.cloneNode(true); btnClose.parentNode.replaceChild(newBtnClose, btnClose);

            const closeModal = () => container.classList.add('hidden');

            newBtnOk.onclick = () => { closeModal(); if (onOk) onOk(); };
            newBtnClose.onclick = () => { closeModal(); if (onCancel) onCancel(); };

            if (onCancel) { newBtnCancel.classList.remove('hidden'); newBtnCancel.onclick = () => { closeModal(); if (onCancel) onCancel(); }; }
            else { newBtnCancel.classList.add('hidden'); }
        }
