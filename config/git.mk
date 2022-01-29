push: git-push

# from https://gist.github.com/amitchhajer/4461043#gistcomment-2349917
git-stats: ## print git contributor line counts (approx, for fun)
	git ls-files | while read f; do git blame -w -M -C -C --line-porcelain "$$f" |\
		grep -I '^author '; done | sort -f | uniq -ic | sort -n

git-push: ## push to both github and gitlab
	git push $(GIT_ARGS) github $(GIT_BRANCH)
	git push $(GIT_ARGS) gitlab $(GIT_BRANCH)
